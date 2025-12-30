' QChannel - Main Entry Point
' BrightScript Application

sub Main(args as Dynamic)
    ' Initialize the application
    screen = CreateObject("roSGScreen")
    m.port = CreateObject("roMessagePort")
    screen.setMessagePort(m.port)
    
    ' Create the main scene
    scene = screen.CreateScene("MainScene")
    screen.show()
    
    ' Pass any deep link arguments
    if args.contentId <> invalid and args.mediaType <> invalid
        scene.deepLink = {
            contentId: args.contentId,
            mediaType: args.mediaType
        }
    end if
    
    ' Main event loop
    while true
        msg = wait(0, m.port)
        msgType = type(msg)
        
        if msgType = "roSGScreenEvent"
            if msg.isScreenClosed()
                return
            end if
        end if
    end while
end sub
