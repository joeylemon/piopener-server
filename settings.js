export const OPEN_AND_CLOSE = {
    Name: "Openings and closings",
    Entries: [
        {
            SettingName: "Notify on long open time", 
            SettingKey: "notify_on_long_open", 
            Description: "Send a notification when the door has been open for a long time"
        },
        {
            SettingName: "Notify on all opens", 
            SettingKey: "notify_on_all_opens", 
            Description: "Send a notification when the door has been opened"
        },
        {
            SettingName: "Open door upon arrival", 
            SettingKey: "open_upon_arrival", 
            Description: "Automatically open the door when you arrive at the apartment"
        }
    ]
}

export const ALL = [OPEN_AND_CLOSE]