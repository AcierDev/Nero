export class CommandCheckError
{
    private _message: string;

    constructor(options: { message: string })
    {
        this.message = options.message;
    }

    get message(): string
    {
        return this._message;
    }

    set message(message)
    {
        this._message = message;
    }
}