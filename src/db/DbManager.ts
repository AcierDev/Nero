import 'reflect-metadata';
import Nedb from 'nedb-promises';
import { classToPlain } from 'class-transformer';
import {Deserializer} from "../util/Deserializer";
import {NamedClass} from "../interfaces/NamedClass";
import {DbTypes} from "./DbTypes";
import ModActionDbObj = DbTypes.ModActionDbType;
import DurationModActionDbObj = DbTypes.DurationActionDbType;

export class DbManager
{
    private static db = new Nedb({autoload: true, filename: "./src/db/data/moderation.db"});

    public static async storeAction(action: ModActionDbObj | DurationModActionDbObj)
    {
        // Serialize and insert object
        return await this.db.insert(classToPlain(action));
    }

    public static async fetchLogs(fetchOptions): Promise<(ModActionDbObj | DurationModActionDbObj)[]>
    {
        // Create a blank array to push to
        let arr: (ModActionDbObj | DurationModActionDbObj)[] = []
        // Fetch documents from db
        const docs: NamedClass[] = await this.db.find(fetchOptions);
        // For each document
        for (const doc of docs)
        {
            arr.push(Deserializer.deserialize(doc))
        }
        return arr;
    }


    public static async deleteAction(fetchOptions)
    {
        // Remove the document from the db
        return await this.db.remove(fetchOptions, {});
    }
}