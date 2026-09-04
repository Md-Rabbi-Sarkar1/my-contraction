import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { TaskService } from "./task.service";
import { QueryTask } from "./task.interface";
import { TaskQuerySchema } from "./task.validation";

const create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
    const {id} = req.params
    const payload = req.body;
    
    console.log(id)
    const result = await TaskService.create(user as JwtPayload,id as string,payload)

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "Successfully created task",
            data: { result}
        });
});
const listAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
    const {id} = req.params
     const cleanFilters = TaskQuerySchema
     .parse(req.query);
    const result = await TaskService.listall(user as JwtPayload,id as string,cleanFilters )

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "Task retrive succefully",
            data: { result}
        });
});


const transitionStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
   
    const user = req.user
    const {id} = req.params
     const {status} = req.body

    const result = await TaskService.transitionStatus(user as JwtPayload,id as string,status )

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "Status change succefully",
            data: { result}
        });
});


export const TaskController = {
    create,
    listAll,
    transitionStatus
}