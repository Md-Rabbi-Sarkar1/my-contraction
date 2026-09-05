import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { MeterialService } from "./material.service";
import { CreateMaterialInput, createMaterialSchema, InventoryTxInput, inventoryTxSchema } from "./material.validation";

const create= catchAsync(async (req: Request, res: Response, next: NextFunction ) => {
   
    const user = req.user
     const cleanFilters = createMaterialSchema.parse(req.body)

    const result = await MeterialService.create(user as JwtPayload,cleanFilters as CreateMaterialInput )

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "Meterial create succefully",
            data: { result}
        });
});

const recordTransaction= catchAsync(async (req: Request, res: Response, next: NextFunction ) => {
   
    const user = req.user
    const {id} =req.params
     const cleanFilters = inventoryTxSchema.parse(req.body)

    const result = await MeterialService.recordTransaction(user as JwtPayload,id as string ,cleanFilters as InventoryTxInput )

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "Meterial create succefully",
            data: { result}
        });
});

export const MeterialController ={
    create,
    recordTransaction
}