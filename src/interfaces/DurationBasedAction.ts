export interface DurationBasedAction
{
    // Duration of this action
    _duration: number
    // Get the duration remaining for this action
    getDurationRemaining(): number
}
