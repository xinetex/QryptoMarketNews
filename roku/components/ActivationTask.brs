sub init()
    m.top.functionName = "execute"
end sub

sub execute()
    command = m.top.command
    
    if command = "getCode"
        getCode()
    else if command = "poll"
        pollStatus()
    end if
end sub

sub getCode()
    serial = m.top.rokuSerial
    if serial = invalid or serial = "" then serial = "UNKNOWN_SERIAL"
    
    ' QChannel Activation API
    url = "https://qchannel.app/api/activate/code"
    
    request = CreateObject("roUrlTransfer")
    request.SetCertificatesFile("common:/certs/ca-bundle.crt")
    request.InitClientCertificates()
    request.SetUrl(url)
    request.AddHeader("Content-Type", "application/json")
    
    json = FormatJson({roku_serial: serial, app: "qchannel"})
    
    response = request.PostFromString(json)
    
    if response <> ""
        jsonObj = ParseJson(response)
        if jsonObj <> invalid
            m.top.codeResult = jsonObj
        else
            ' Fallback: Generate local code if API unavailable
            m.top.codeResult = {code: generateLocalCode(), local: true}
        end if
    else
        ' Fallback for offline testing
        m.top.codeResult = {code: generateLocalCode(), local: true}
    end if
end sub

sub pollStatus()
    code = m.top.deviceCode
    if code = invalid or code = ""
        m.top.pollResult = {error: "Missing device code"}
        return
    end if
    
    url = "https://qchannel.app/api/activate/poll"
    
    request = CreateObject("roUrlTransfer")
    request.SetCertificatesFile("common:/certs/ca-bundle.crt")
    request.InitClientCertificates()
    request.SetUrl(url)
    request.AddHeader("Content-Type", "application/json")
    
    json = FormatJson({device_code: code})
    
    response = request.PostFromString(json)
    
    if response <> ""
        jsonObj = ParseJson(response)
        if jsonObj <> invalid
            m.top.pollResult = jsonObj
        else
            m.top.pollResult = {status: "pending"}
        end if
    else
        m.top.pollResult = {status: "pending"}
    end if
end sub

function generateLocalCode() as string
    ' Generate a random 6-character code for local testing
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    code = ""
    for i = 0 to 5
        idx = Rnd(32) - 1
        code = code + chars.Mid(idx, 1)
    end for
    return code
end function
