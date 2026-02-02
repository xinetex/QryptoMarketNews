' DeviceTask.brs
' Handles device linking API interactions

sub init()
    m.top.functionName = "execute"
end sub

sub execute()
    command = m.top.command
    
    if command = "getCode"
        getCode()
    else if command = "checkStatus"
        checkStatus()
    end if
end sub

sub getCode()
    url = m.top.apiBaseUrl + "/api/device/code"
    
    payload = {
        roku_serial: m.top.rokuSerial,
        device_name: m.top.deviceName
    }
    
    response = makeRequest(url, payload)
    
    if response <> invalid and response.data <> invalid
        m.top.codeResult = response.data
    else
        m.top.codeResult = { error: "Failed to get code" }
    end if
end sub

sub checkStatus()
    code = m.top.activationCode
    if code = "" 
        m.top.statusResult = { error: "No code provided" }
        return
    end if
    
    url = m.top.apiBaseUrl + "/api/device/status?code=" + code
    
    ' GET request
    request = CreateObject("roUrlTransfer")
    request.setUrl(url)
    request.setCertificatesFile("common:/certs/ca-bundle.crt")
    request.initClientCertificates()
    request.addHeader("Accept", "application/json")
    
    responseStr = request.getToString()
    
    if responseStr <> invalid and responseStr <> ""
        json = ParseJson(responseStr)
        if json <> invalid and json.data <> invalid
            m.top.statusResult = json.data
        else
            m.top.statusResult = { error: "Invalid response" }
        end if
    else
        m.top.statusResult = { error: "Network error" }
    end if
end sub

function makeRequest(url as string, payload as object) as object
    request = CreateObject("roUrlTransfer")
    request.setUrl(url)
    request.setCertificatesFile("common:/certs/ca-bundle.crt")
    request.initClientCertificates()
    request.addHeader("Content-Type", "application/json")
    request.addHeader("Accept", "application/json")
    
    ' Use message port for reliable response handling
    port = CreateObject("roMessagePort")
    request.setMessagePort(port)
    
    jsonPayload = FormatJson(payload)
    
    if request.AsyncPostFromString(jsonPayload)
        msg = wait(10000, port) ' 10 second timeout
        if type(msg) = "roUrlEvent"
            code = msg.getResponseCode()
            if code = 200 or code = 201
                resBody = msg.getString()
                if resBody <> invalid and resBody <> ""
                    return ParseJson(resBody)
                end if
            else
                print "[DeviceTask] API Error: " + str(code)
            end if
        else
            print "[DeviceTask] Request timed out"
        end if
    else
        print "[DeviceTask] Failed to initiate request"
    end if
    
    return invalid
end function
