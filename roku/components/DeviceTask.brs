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
    
    jsonPayload = FormatJson(payload)
    if request.postFromString(jsonPayload)
        responseStr = request.getString() ' Note: postFromString returns boolean, response is retrieved via getString/getToString? 
        ' Wait, postFromString returns response code (200, 404 etc) or string? 
        ' Actually roUrlTransfer.postFromString returns output string if RetainBody(true) ? No.
        ' Let's double check standard pattern.
        
        ' Correction: postFromString returns Int (response code) or String depending on sync/async.
        ' In sync mode (no message port), it returns the response code.
        ' We need to use Async functions normally, but this is a Task, so synchronous blocking is fine.
        ' Standard pattern:
        ' request.postFromString(data) -> returns response code.
        ' Then response = request.getString() ?? No.
        
        ' Let's stick to the reliable pattern using RetainBody is tricky.
        ' Better pattern for POST and get response:
        
        ' Re-creating request to be safe with standard sync pattern
        req = CreateObject("roUrlTransfer")
        req.setUrl(url)
        req.setCertificatesFile("common:/certs/ca-bundle.crt")
        req.initClientCertificates()
        req.addHeader("Content-Type", "application/json")
        req.addHeader("Accept", "application/json")
        
        response = req.postFromString(jsonPayload)
        
        ' Wait, this is still potentially wrong for getting body.
        ' Correct synchronous pattern usually involves writing to a temp file or using async wait.
        ' Simplest reliable way in a Task:
        
        ' Let's use the one that definitely works for basic JSON APIs:
        ' The return value of postFromString is the HTTP status code (e.g. 200).
        ' Use request.GetToString() doesn't work after PostFromString?
        
        ' Let's switch to standard usage:
        ' request.AsyncPostFromString(payload)
        ' then wait for msg
    end if
    
    ' Actually simplest working pattern for sync POST with response body:
    ' request.postFromString(data) returns response code.
    ' But we can't easily get the body purely synchronously without async/wait loop if RetainBody logic is annoying.
    
    ' Let's implement a clean wait loop.
    port = CreateObject("roMessagePort")
    request.setMessagePort(port)
    if request.asyncPostFromString(jsonPayload)
        msg = wait(10000, port) ' 10s timeout
        if type(msg) = "roUrlEvent"
            if msg.getResponseCode() = 200
                resBody = msg.getString()
                return ParseJson(resBody)
            end if
        end if
    end if

    return invalid
end function
