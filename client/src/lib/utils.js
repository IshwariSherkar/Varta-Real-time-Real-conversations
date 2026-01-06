export function formatMessageTime(date){
    return new Date(date).toLocaleTimeString("en-US",{
        hour: "2-digit",     //Always show 2 digits for hour (e.g., 09, 17).
        minute: "2-digit",   //Always show 2 digits for minutes (e.g., 03, 45).
        hour12: false,   //Use 24-hour format (17:30 instead of 5:30 PM).
    })
}

/* This function takes a date (a timestamp or Date object) 
and returns only the time in a clean, readable format like: (09:05)
new Date(date) : Converts the input into a JavaScript Date object.
.toLocaleTimeString("en-US", {...}) : Formats the time according to the US locale settings but with your custom options. */