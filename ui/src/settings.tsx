import { Player } from "./state"
import { FormControlLabel, FormGroup, MenuItem, Select, SelectChangeEvent, Slider, Switch } from "@mui/material"


type Settings = {
    // defines which player will be the AI or null to make human VS human
    aiPlayer: Player | null

    // whether to make the AI randomize plays or be deterministic
    aiRandomize: boolean

    // 0 for purely random AI or 1 for optimal player
    aiIntelligence: number

    // whether to show the best play hints
    showHints: boolean

    // if false, then the move that will be deleted after the play is
    // not shown in lighter color
    highlightMoveToDelete: boolean
}

export const DEFAULT_SETTINGS: Settings = {
    aiPlayer: Player.O,
    aiRandomize: true,
    aiIntelligence: 100,
    showHints: false,
    highlightMoveToDelete: true,
}


type SettingsMenuProps = {
    values: Settings,
    setValues: React.Dispatch<React.SetStateAction<Settings>>,
}

export function SettingsMenu({ values, setValues }: SettingsMenuProps) {
    function aiRandomizeHandleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setValues({ ...values, aiRandomize: event.target.checked })
    }
    function aiIntelligenceHandleChange(event: Event, newValue: number | number[]) {
        setValues({ ...values, aiIntelligence: (newValue as number) / 100 })
    }
    function aiPlayerHandleChange(event: SelectChangeEvent) {
        let newPlayer: Player | null = event.target.value as Player
        if (event.target.value != Player.O && event.target.value != Player.X) {
            newPlayer = null
        }
        setValues({ ...values, aiPlayer: newPlayer })
    }
    function showHintsHandleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setValues({ ...values, showHints: event.target.checked })
    }
    function highlightMoveToDeleteHandleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setValues({ ...values, highlightMoveToDelete: event.target.checked })
    }

    return <>
        <FormGroup>
            <FormControlLabel control={
                <Slider
                    aria-label="AI intelligence"
                    value={values.aiIntelligence}
                    onChange={aiIntelligenceHandleChange}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                />
            } label="Ai intelligence" />

            <FormControlLabel control={
                <Switch
                    checked={values.aiRandomize}
                    onChange={aiRandomizeHandleChange}
                    aria-label="Randomize AI"
                />
            } label="Randomize AI" />

            <FormControlLabel control={
                <Switch
                    checked={values.showHints}
                    onChange={showHintsHandleChange}
                />
            } label="Show hints" />

            <FormControlLabel control={
                <Switch
                    checked={values.highlightMoveToDelete}
                    onChange={highlightMoveToDeleteHandleChange}
                />
            } label="Highlight move that will be deleted next" />

            <FormControlLabel control={
                <Select
                    value={values.aiPlayer as string || "None"}
                    onChange={aiPlayerHandleChange}
                >
                    <MenuItem value={Player.O}>O</MenuItem>
                    <MenuItem value={Player.X}>X</MenuItem>
                    <MenuItem value="None">None</MenuItem>
              </Select>
            } label="AI player" />
        </FormGroup>
    </>
}
