sub init()
    m.top.functionName = "execute"
end sub

sub execute()
    requestType = m.top.requestType
    
    if requestType = "podcasts"
        fetchPodcasts()
    else if requestType = "zones"
        fetchZones()
    else if requestType = "watchlist"
        fetchWatchlist()
    else if requestType = "nfts"
        fetchNFTs()
    end if
end sub

sub fetchNFTs()
    baseUrl = "http://192.168.4.108:3000/api/content/nfts"
    modes = ["trending", "bluechip", "aesthetic", "generative"]
    titles = ["Trending Collections", "Blue Chip Assets", "Aesthetic Curated", "Generative Art"]
    
    result = CreateObject("roSGNode", "ContentNode")
    
    request = CreateObject("roUrlTransfer")
    request.SetCertificatesFile("common:/certs/ca-bundle.crt")
    request.InitClientCertificates()
    
    for i = 0 to modes.count() - 1
        mode = modes[i]
        url = baseUrl + "?mode=" + mode
        request.SetUrl(url)
        response = request.GetToString()
        
        if response <> ""
            json = ParseJson(response)
            if json <> invalid and json.collections <> invalid
                row = result.createChild("ContentNode")
                row.title = titles[i]
                
                for each collection in json.collections
                    for each item in collection.items
                        node = row.createChild("ContentNode")
                        node.title = item.title
                        
                        ' NFTItem fields
                        node.HDPOSTERURL = item.image
                        node.SHORTDESCRIPTIONLINE1 = collection.name
                        node.SHORTDESCRIPTIONLINE2 = "Floor: " + str(collection.floor) + " ETH"
                        
                        ' Actions
                        node.url = item.image
                        node.streamFormat = "img"
                    end for
                end for
            end if
        end if
    end for
    
    m.top.contentResult = result
end sub

sub fetchWatchlist()
    ' Use local dev server for user-specific data
    url = "http://192.168.4.34:3000/api/user/watchlist"
    
    request = CreateObject("roUrlTransfer")
    request.SetCertificatesFile("common:/certs/ca-bundle.crt")
    request.InitClientCertificates()
    request.SetUrl(url)
    
    response = request.GetToString()
    
    if response <> ""
        json = ParseJson(response)
        if json <> invalid and json.items <> invalid
            result = CreateObject("roSGNode", "ContentNode")
            row = result.createChild("ContentNode")
            row.title = "My Watchlist"
            
            for each coin in json.items
                item = row.createChild("ContentNode")
                item.title = coin.name
                item.SHORTDESCRIPTIONLINE1 = ucase(coin.symbol) + " $" + str(coin.price)
                ' Use generic coin icon or dynamic image if available
                item.HDPOSTERURL = "pkg:/images/icons/coin_placeholder.png"
                if coin.image <> invalid then item.HDPOSTERURL = coin.image
                
                item.url = "coin://" + coin.id
                item.streamFormat = "coin_detail" 
            end for
            
            m.top.contentResult = result
        end if
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
