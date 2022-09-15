/**
 * A simple class to ensure that an id is unique and has not yet been encountered
 */
export class InteractionUtil
{
    // Array of id's that have already been encountered
    private static cache: string[] = [];

    /**
     * Returns a boolean indicating whether this id has previously been encountered
     * @param id
     */
    public static isUnique(id: string): boolean
    {
        if (this.cache.includes(id))
            return false;
        else {
            this.cache.push(id);
            return true;
        }
    }

    /**
     * Remove the oldest element in the cache
     */
    public static shift()
    {
        this.cache.shift();
    }
}

// Remove the oldest element from the cache every 30 seconds
setInterval(() => {
    InteractionUtil.shift();
}, 30 * 1000)