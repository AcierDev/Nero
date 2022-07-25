import 'reflect-metadata';
import Nedb from 'nedb-promises';
import { classToPlain } from 'class-transformer';
import {Deserializer} from "../util/db/Deserializer";
import {NamedClass} from "./interfaces/NamedClass";
import {DbTypes} from "./types/DbTypes";
import ModActionDbObj = DbTypes.ModActionDbObj;
import DurationModActionDbObj = DbTypes.DurationModActionDbObj;

export class DbManager
{
    private static db = new Nedb({autoload: true, filename: "./src/db/data/moderation.db"});

    public static async storeAction(action: ModActionDbObj | DurationModActionDbObj)
    {
        // Serialize and insert object
        return await this.db.insert(classToPlain(action));
    }

    public static async fetchAction(fetchOptions)
    {
        // Fetch object from db
        const dbObj: NamedClass = await this.db.findOne(fetchOptions)
        // Deserialize and return object
        return Deserializer.deserialize(dbObj);
    }
}