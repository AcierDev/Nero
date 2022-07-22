import 'reflect-metadata';
import Nedb from 'nedb-promises';
import {ModActionDbObj} from "./types/ModActionDbObj";
import {DurationModActionDbObj} from "./types/DurationModActionDbObj";
import { classToPlain } from 'class-transformer';

export class DbManager
{
    private static db = new Nedb({autoload: true, filename: "./src/db/data/moderation.db"});

    public static async storeAction(action: ModActionDbObj | DurationModActionDbObj)
    {
        const plainActionObj = classToPlain(action);
        await this.db.insert(plainActionObj);
    }

    public static async fetchAction(fetchOptions)
    {
        return await this.db.find(fetchOptions)
    }
}