export interface IcreateProjectSchema {
     name: string;
    description: string;
    location: string;
    clientInfo?: string;
    startDate?: string;
    expectedEndDate?: string;
    budget?: string;
    managerId:string
 }