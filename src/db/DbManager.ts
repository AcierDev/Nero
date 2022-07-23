import 'reflect-metadata';
import Nedb from 'nedb-promises';
import { classToPlain } from 'class-transformer';
import {Deserializer} from "../util/db/Deserializer";
import {NamedClass} from "../moderation/interfaces/NamedClass";
import {DbTypes} from "./types/DbTypes";
import ModActionDbObj = DbTypes.ModActionDbObj;
import DurationModActionDbObj = DbTypes.DurationModActionDbObj;

export class DbManager
{
    private static db = new Nedb({autoload: true, filename: "./src/db/data/moderation.db"});

    public static async storeAction(action: ModActionDbObj | DurationModActionDbObj)
    {
        const plainActionObj = classToPlain(action);
        return await this.db.insert(plainActionObj);
    }

    public static async fetchAction(fetchOptions)
    {
        // Fetch database object
        const dbObj: NamedClass = await this.db.findOne(fetchOptions)
        // Deserialize the object
        return Deserializer.deserialize(dbObj);
    }
}