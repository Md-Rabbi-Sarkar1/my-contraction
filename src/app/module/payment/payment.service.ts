/** biome-ignore-all lint/correctness/noUnusedVariables: <explanation> */
import { stringify } from "node:querystring";
import config from "../../config";
import { getBkashIdToken } from "../../lib/bkash"
import { prisma } from "../../lib/prisma"
import { RequestUser } from "../../middleware/checkAuth"
import { AppError } from "../../utils/AppError"
import httpStatus from "http-status";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { transporter } from "../../lib/nodemailer";
import PDFDocument from "pdfkit";

const payCompany = async (user: RequestUser) => {

    const companyId = user.companyId
    console.log(companyId)
    const existCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        },
        include: {
            users: true,
            payments: {
                select: {
                    status: true
                }
            }
        }
    })
    if (!existCompany) {
        throw new Error("Company Does not exist")
    }
    const hasPaidStatus = existCompany.payments.some(payment => payment.status === 'PAID');

    if (hasPaidStatus) {
        throw new Error("Already Paid for the company")
    }

    const bkashIdToken = await getBkashIdToken();
    if (!bkashIdToken) {
        throw new AppError(httpStatus.BAD_GATEWAY, "No Bkash Access Token Found!");
    }

    const uniqueInvoiceNumber = `${existCompany.id}-${Date.now()}`;
    const bkashCreatePaymentResponse = await fetch(
        `${config.bkash_base_url}/tokenized/checkout/create`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: bkashIdToken,
                "X-App-Key": config.bkash_app_key,
            },
            body: JSON.stringify({
                mode: "0011",
                // payerReference: "0123456789", //user email or phone number
                payerReference: user.email, //user email or phone number
                callbackURL: `${config.bkash_callback_url}/callback`,
                amount: "100",
                currency: "BDT",
                intent: "sale",
                // merchantInvoiceNumber: "Inv4" // comapny id
                merchantInvoiceNumber: uniqueInvoiceNumber, // apppointment id
            }),
        },
    );

    const bkashCreatePaymentResult = await bkashCreatePaymentResponse.json();


    await prisma.payment.upsert({
        where: {
            companyId: user.companyId
        },
        // Fields to update if the record ALREADY exists
        update: {
            merchantInvoiceNumber: bkashCreatePaymentResult.merchantInvoiceNumber,
            gatewayResponse: bkashCreatePaymentResult,
            bkashPaymentId: bkashCreatePaymentResult.paymentID
        },
        // Fields required to construct a new record if it DOES NOT exist
        create: {
            amount: "100", // Required: Maps to Decimal(10,2)
            merchantInvoiceNumber: bkashCreatePaymentResult.merchantInvoiceNumber, // Required
            bkashPaymentId: bkashCreatePaymentResult.paymentID, // Optional in schema, but good to set on create
            gatewayResponse: bkashCreatePaymentResult, // Optional in schema, but good to set on create

            // Connect the 1-to-1 company relation
            company: {
                connect: { id: user.companyId }
            }
        }
    });
    return {
        paymentUrl: bkashCreatePaymentResult.bkashURL
    }
}

const paymentCallback = async (query: Record<string, any>) => {
    const transactionResult = await prisma.$transaction(async (tx) => {
        const paymentId = query.paymentID;

        if (!paymentId) {
            throw new AppError(httpStatus.BAD_REQUEST, "Payment Id Missing");
        }

        const status = query.status;

        if (!status) {
            throw new AppError(httpStatus.BAD_REQUEST, "Payment Status is Missing");
        }

        const bkashIdToken = await getBkashIdToken();

        if (!bkashIdToken) {
            throw new AppError(httpStatus.BAD_GATEWAY, "No Bkash Access Token Found!");
        }

        const executedPaymentResponse = await fetch(
            `${config.bkash_base_url}/tokenized/checkout/execute`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: bkashIdToken,
                    "X-App-Key": config.bkash_app_key,
                },

                body: JSON.stringify({
                    paymentID: paymentId,
                }),
            },
        );

        const executedPaymentResult = await executedPaymentResponse.json();

        if (status === "success") {



            const invoiceNumber = executedPaymentResult.merchantInvoiceNumber; 
    const cleanCompanyId = invoiceNumber.split("-").slice(0, 5).join("-");


    

            const company = await tx.company.findUnique({
                where: {
                    id: cleanCompanyId
                },
                include: {
                    users: true,
                    payments: true
                }
            });

            if (!company) {
                throw new AppError(httpStatus.NOT_FOUND, "Company Not Found!")
            }

            await tx.payment.update({
                where: {
                    merchantInvoiceNumber: invoiceNumber,
                    bkashPaymentId: paymentId,
                },
                data: {
                    status: PaymentStatus.PAID,
                    bkashTrxId: executedPaymentResult.trxID,
                    paidAt: executedPaymentResult.paymentExecuteTime,
                    gatewayResponse: executedPaymentResult,
                },
            });

            const adminUser = company.users.find(user => user.role === 'ADMIN');
            const pdfDocument = new PDFDocument({ margin: 50 });


            const pdfChunks: Buffer[] = []

            pdfDocument.on("data", (chunk: Buffer) => {
                pdfChunks.push(chunk)
            })

            const pdfReadyPromise = new Promise<Buffer>((resolve) => {
                pdfDocument.on("end", () => {
                    resolve(Buffer.concat(pdfChunks))
                })
            })

            pdfDocument.fontSize(20).text("SAAS Provider", { align: "center" });
            pdfDocument.fontSize(14).text("Payment Invoice", { align: "center" });
            pdfDocument.moveDown(2)

            pdfDocument.fontSize(12).text(`Patient Name: ${adminUser?.name}`);
            pdfDocument.text(`Amount Paid: ${executedPaymentResult.amount} BDT`);
            pdfDocument.text(`Payment Method: bKash`);
            pdfDocument.text(`Transaction Id: ${executedPaymentResult.trxID}`);
            pdfDocument.text(`Paid At: ${executedPaymentResult.paymentExecuteTime}`);

            pdfDocument.end()

            const pdfBuffer = await pdfReadyPromise;

            await transporter.sendMail({
                from: config.email_sender,
                to: adminUser?.email,
                subject: "Your payment Invoice",
                text: "Thank you for subscription. Please find your invoice attached.",
                attachments: [
                    {
                        filename: "invoice.pdf",
                        content: pdfBuffer
                    }
                ]
            })

            return {
                redirectUrl: `${config.frontend_url}/dashboard?status=success`,
            };
        } else if (status === "failure") {
            await tx.payment.update({
                where: {
                    bkashPaymentId: paymentId,
                },
                data: {
                    status: PaymentStatus.FAILED,
                    gatewayResponse: query,
                },
            });
            return {
                redirectUrl: `${config.frontend_url}/dashboard?status=failue`,
            };
        } else if (status === "cancel") {
            await tx.payment.update({
                where: {
                    bkashPaymentId: paymentId,
                },
                data: {
                    status: PaymentStatus.CANCELLED,
                    gatewayResponse: query,
                },
            });
            return {
                executedPaymentResult,
                redirectUrl: `${config.frontend_url}/dashboard?status=cancel`,
            };
        } else {
            return {
                executedPaymentResult,
                redirectUrl: `${config.frontend_url}/dashboard/?error=payment-failed`,
            };
        }
    }, {
        maxWait: 10000, // default: 2000
        timeout: 30000, // default: 5000
    });

    return transactionResult;
};

export const PaymentServices = {
    payCompany,
    paymentCallback
}