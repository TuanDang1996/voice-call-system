import {ServiceHierarchyRepository} from "@/repository/ServiceHierarchy";
import {Request} from "express";
import {InternalErrorResponse, SuccessResponse} from "@/api/utils/ApiResponse";

export class ServiceHierarchyService {
    public repo: ServiceHierarchyRepository;

    constructor() {
        this.repo = new ServiceHierarchyRepository()
    }

    async createNewService(req:Request, res: any){
        const {name = '', audio_url = '', parent_id = '', type = ''} = req.body;
        const  saved = await this.repo.create({
            name,
            audio_url,
            parent_id,
            type
        })

        if(saved.isNew){
            return new SuccessResponse("The record is saved successful!", null).send(res);
        } else {
            return new InternalErrorResponse("There is an error happen. Pls check log!").send(res);
        }
    }

    async updateService(req:Request, res: any){
        const {id, name, audio_url, parent_id, type} = req.body;
        if(!id)
            return new InternalErrorResponse("Missing the 'id'. Pls check again!").send(res);

        const  saved = await this.repo.update(id, {
            name,
            audio_url,
            parent_id,
            type
        })

        if(saved.isNew){
            return new SuccessResponse("The record is updated successful!", null).send(res);
        } else {
            return new InternalErrorResponse("There is an error happen. Pls check log!").send(res);
        }
    }

    async fetchAllTheService(req:Request, res: any){
        const {page = 1, limit = 10} = req.body;
        const  data = await this.repo.getAllService(page, limit)

        if(data){
            return new SuccessResponse("The record is saved successful!", data).send(res);
        } else {
            return new InternalErrorResponse("There is an error happen. Pls check log!").send(res);
        }
    }

    async removeService(req:Request, res: any){
        const {id} = req.body;
        if(!id)
            return new InternalErrorResponse("Missing the 'id'. Pls check again!").send(res);

        const  saved = await this.repo.delete(id)

        if(saved.ok === 1){
            return new SuccessResponse("The record is removed!", null).send(res);
        } else {
            return new InternalErrorResponse("There is an error happen. Pls check log!").send(res);
        }
    }
}