import {NamedClass} from "../moderation/interfaces/NamedClass";
import {DbTypes} from "../db/types/DbTypes";

export class Deserializer
{
    public static deserialize(json: NamedClass)
    {
        // Generate a blank object of the correct type
        let instance = new DbTypes[json._clazzName]();
        // For every property in the object
        for (const prop in json)
        {
            // If the property is inherited from the base Object class
            if (Object.hasOwnProperty(prop))
            {
                // Ignore the property
                continue;
            }
            // If the property itself is an object, let's deserialize it recursively
            if (json[prop] && typeof json[prop] === 'object')
            {
                instance[prop] = this.deserialize(json[prop]);
            }
            else
            {
                // Assign the property
                instance[prop] = json[prop];
            }
        }
        return instance;
    }
}