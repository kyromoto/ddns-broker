import { Job } from "@server/domains/ip-update-processor/models/Job";
import { ProcessorRegistryService } from "@server/domains/ip-update-processor/service-interfaces";
import EventEmitter from "node:events";



class ProcessorRegistryImpl implements ProcessorRegistryService {
    
    private _registry = new EventEmitter()
    
    register(name: string, process: (name: string, job: Job, cid: string) => Promise<void>): void {
        this._registry.addListener(name, async data => await process(data.name, data.job, data.cid))
    }

    queueJob(name: string, job: Job, cid: string): void {
        this._registry.emit(name, { name, job, cid })
    }

    hasProcessor(name: string): boolean {
        return this._registry.eventNames().includes(name)
    }
    
}


export const makeProcessorRegistry = (): ProcessorRegistryService => new ProcessorRegistryImpl()