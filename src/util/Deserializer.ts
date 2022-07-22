import {NamedClass} from "../moderation/interfaces/NamedClass";

export class Deserializer
{
    public static deserialize(json: NamedClass)
    {
        let obj = new [json.name]();
    }
}