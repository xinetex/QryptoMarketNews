' Prophet TV - Main Entry Point
' BrightScript Application with Voice & Second Screen Support

sub Main(args as Dynamic)
    ' Initialize the application
    screen = CreateObject("roSGScreen")
    m.port = CreateObject("roMessagePort")
    screen.setMessagePort(m.port)
    
    ' Check for launch type (Normal vs Screensaver)
    ' Roku passes 'source' = 'screensaver' when launching as a screensaver
    launchType = "normal"
    if args.source <> invalid and LCase(args.source) = "screensaver"
        launchType = "screensaver"
    end if
    
    if launchType = "screensaver"
        ' Launch strictly as a screensaver
        scene = screen.CreateScene("ScreensaverScene")
        screen.show()
    else
        ' Normal Application Launch
        
        ' Create input handler for voice/ECP (Only needed for main app)
        m.input = CreateObject("roInput")
        m.input.setMessagePort(m.port)
        
        ' Create the main scene
        scene = screen.CreateScene("MainScene")
        screen.show()
        
        ' Pass any deep link arguments (voice search, content launch)
        if args.contentId <> invalid and args.mediaType <> invalid
            scene.deepLink = {
                contentId: args.contentId,
                mediaType: args.mediaType
            }
        end if
        
        ' Handle voice search from launch
        if args.query <> invalid
            scene.voiceQuery = args.query
        end if
        
        ' Generate device pairing token for second screen
        deviceInfo = CreateObject("roDeviceInfo")
        scene.deviceId = deviceInfo.getChannelClientId()
        scene.pairingToken = generatePairingToken(deviceInfo)
    end if
    
    ' Main event loop
    while true
        msg = wait(0, m.port)
        msgType = type(msg)
        
        if msgType = "roSGScreenEvent"
            if msg.isScreenClosed()
                return
            end if
        else if msgType = "roInputEvent"
            ' Handle ECP input (second screen commands, voice)
            ' Only needed if scene supports it (MainScene)
            if launchType = "normal"
                handleInputEvent(msg, scene)
            end if
        end if
    end while
end sub

' Generate a pairing token for second screen sync
function generatePairingToken(deviceInfo as object) as string
    clientId = deviceInfo.getChannelClientId()
    timestamp = CreateObject("roDateTime").asSeconds().toStr()
    
    ' Simple token: first 8 chars of clientId + timestamp mod
    token = left(clientId, 8) + "-" + right(timestamp, 4)
    return uCase(token)
end function

' Handle ECP input events (second screen, voice)
sub handleInputEvent(msg as object, scene as object)
    info = msg.getInfo()
    
    ' Voice search query
    if info.query <> invalid
        print "[Main] Voice query received: " + info.query
        scene.voiceQuery = info.query
    end if
    
    ' Deep link from second screen
    if info.contentId <> invalid
        print "[Main] Deep link received: " + info.contentId
        scene.deepLink = {
            contentId: info.contentId,
            mediaType: info.mediaType
        }
    end if
    
    ' ECP navigation commands from phone
    if info.action <> invalid
        print "[Main] Action received: " + info.action
        scene.ecpAction = info.action
    end if
end sub

