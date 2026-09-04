import { JwtPayload } from "jsonwebtoken"
import { ProjectStatus } from "../../../generated/prisma/enums";
import { NotificationListFilters } from "./notification.interface";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const list = async (user:JwtPayload,query:  { page: number; pageSize: number; unreadOnly?: boolean | undefined })=>{
    const filters: NotificationListFilters = {
      userId: user.userId,
      page: query.page,
      pageSize: query.pageSize,
    };
     if (query.unreadOnly !== undefined) filters.unreadOnly = query.unreadOnly;

      const where: Prisma.NotificationWhereInput = { userId: filters.userId };
    if (filters.unreadOnly === true) {
      where.readAt = null;
    }
const result = await prisma.$transaction([
  prisma.notification.findMany({
    where,
    orderBy:{
      createdAt:"desc"
    },
    skip:(query.page-1) *filters.pageSize,
    take:filters.pageSize
  }),
  prisma.notification.count({where})
])
return result

    }
export const NotificationService ={
    list
}