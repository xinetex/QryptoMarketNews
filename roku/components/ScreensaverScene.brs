' Prophet TV Screensaver - Simplified
' Static display with clock only, no API calls

sub init()
    m.top.setFocus(true)
    
    ' Get node references
    m.clockLabel = m.top.findNode("clockLabel")
    m.dateLabel = m.top.findNode("dateLabel")
    
    ' Setup clock timer
    m.clockTimer = m.top.findNode("clockTimer")
    m.clockTimer.observeField("fire", "onClockTimerFired")
    m.clockTimer.control = "start"
    
    ' Initial updates
    updateClock()
    updateDate()
end sub

sub onClockTimerFired()
    updateClock()
end sub

sub updateClock()
    dt = CreateObject("roDateTime")
    dt.toLocalTime()
    
    hour = dt.getHours()
    mins = dt.getMinutes()
    ampm = "AM"
    
    if hour >= 12
        ampm = "PM"
        if hour > 12 then hour = hour - 12
    end if
    if hour = 0 then hour = 12
    
    minStr = str(mins).trim()
    if mins < 10 then minStr = "0" + minStr
    
    m.clockLabel.text = str(hour).trim() + ":" + minStr + " " + ampm
end sub

sub updateDate()
    dt = CreateObject("roDateTime")
    dt.toLocalTime()
    
    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    
    dayName = days[dt.getDayOfWeek()]
    monthName = months[dt.getMonth() - 1]
    dayNum = dt.getDayOfMonth()
    
    m.dateLabel.text = dayName + ", " + monthName + " " + str(dayNum).trim()
end sub

function onKeyEvent(key as string, press as boolean) as boolean
    if not press then return false
    
    if key = "OK" or key = "back"
        m.top.exitRequested = true
        m.top.visible = false
        return true
    end if
    
    return false
end function
