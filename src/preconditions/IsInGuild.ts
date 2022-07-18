import {AllFlowsPrecondition, Args} from "@sapphire/framework";
import {Message} from "discord.js";

export class IsInGuild extends AllFlowsPrecondition {
    // Chat Command
    public override async messageRun(message: Message) {
        return this.ok();
    }
}