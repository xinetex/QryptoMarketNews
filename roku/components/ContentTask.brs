sub init()
    m.top.functionName = "execute"
end sub

sub execute()
    requestType = m.top.requestType
    
    if requestType = "podcasts"
        fetchPodcasts()
    else if requestType = "zones"
        fetchZones()
    end if
end sub

sub fetchPodcasts()
    url = "https://qryptomarket-news.vercel.app/api/content/youtube"
    
    request = CreateObject("roUrlTransfer")
    request.SetCertificatesFile("common:/certs/ca-bundle.crt")
    request.InitClientCertificates()
    request.SetUrl(url)
    
    response = request.GetToString()
    
    if response <> ""
        json = ParseJson(response)
        if json <> invalid and json.feeds <> invalid
            result = CreateObject("roSGNode", "ContentNode")
            
            for each feed in json.feeds
                row = result.createChild("ContentNode")
                row.title = feed.title
                
                for each video in feed.items
                    item = row.createChild("ContentNode")
                    item.title = video.title
                    item.HDPOSTERURL = video.thumbnail
                    item.SHORTDESCRIPTIONLINE1 = video.title
                    item.SHORTDESCRIPTIONLINE2 = video.author
                    item.url = video.link
                    item.streamFormat = "mp4"
                end for
            end for
            
            m.top.contentResult = result
        end if
    end if
end sub

sub fetchZones()
    url = "https://qryptomarket-news.vercel.app/api/defi/zones"
    
    request = CreateObject("roUrlTransfer")
    request.SetCertificatesFile("common:/certs/ca-bundle.crt")
    request.InitClientCertificates()
    request.SetUrl(url)
    
    response = request.GetToString()
    
    if response <> ""
        json = ParseJson(response)
        if json <> invalid and json.zones <> invalid
            result = CreateObject("roSGNode", "ContentNode")
            row = result.createChild("ContentNode")
            row.title = "Active Zones"
            
            for each zone in json.zones
                item = row.createChild("ContentNode")
                item.title = zone.name
                item.SHORTDESCRIPTIONLINE1 = zone.description
                item.HDPOSTERURL = "pkg:/images/zones/" + zone.id + "-hero.png"
                item.action = "zone"
                item.zoneId = zone.id
            end for
            
            m.top.contentResult = result
        end if
    end if
end sub
