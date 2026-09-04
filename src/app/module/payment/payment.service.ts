import { stringify } from "node:querystring";
import config from "../../config";
import { getBkashIdToken } from "../../lib/bkash"
import { prisma } from "../../lib/prisma"
import { RequestUser } from "../../middleware/checkAuth"
import { AppError } from "../../utils/AppError"
import httpStatus from "http-status";

const payCompany =async(user:RequestUser) =>{

    const companyId = user.companyId
    console.log(companyId)
    const existCompany = await prisma.company.findUnique ({
        where:{
            id:companyId
        },
        include:{
            users:true,
            payments:{
                select:{
                    status:true
                }
            }
        }
    })
    if(!existCompany){
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
    const amount = 100000;
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
				amount: "10000",
				currency: "BDT",
				intent: "sale",
				// merchantInvoiceNumber: "Inv4" // comapny id
				merchantInvoiceNumber: existCompany.id, // apppointment id
			}),
		},
	);

    	const bkashCreatePaymentResult = await bkashCreatePaymentResponse.json();

        const paymentAmount = 10000; 

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
        amount: paymentAmount, // Required: Maps to Decimal(10,2)
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

export const PaymentServices={
    payCompany
}