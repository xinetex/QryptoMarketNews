' Prophet TV NFT Gallery - Cinematic Logic
' Handles full-screen immersive display and horizontal strip navigation

sub init()
    m.top.setFocus(true)
    
    ' Node references
    m.featuredImage = m.top.findNode("featuredImage")
    m.featuredTitle = m.top.findNode("featuredTitle")
    m.featuredCollection = m.top.findNode("featuredCollection")
    m.featuredPrice = m.top.findNode("featuredPrice")
    m.curationReason = m.top.findNode("curationReason")
    
    m.nftGrid = m.top.findNode("nftGrid")
    m.nftGrid.observeField("itemFocused", "onItemFocused")
    m.nftGrid.observeField("itemSelected", "onItemSelected")
    
    ' Stats
    m.statVolume = m.top.findNode("statVolume")
    m.statOwners = m.top.findNode("statOwners")
    
    ' Filter tabs
    m.tabs = [
        m.top.findNode("tab1Bg"),
        m.top.findNode("tab2Bg"),
        m.top.findNode("tab3Bg"),
        m.top.findNode("tab4Bg")
    ]
    m.currentTab = 0
    m.curationModes = ["trending", "bluechip", "aesthetic", "generative"]
    
    ' Data State
    m.collections = []
    m.currentCollection = invalid
    m.lastInteractionTime = 0
    
    ' Initialize crypto service
    m.cryptoService = m.top.findNode("cryptoService")
    if m.cryptoService <> invalid
        m.cryptoService.observeField("nftData", "onNftDataReceived")
    end if
    
    ' Timers
    m.autoScrollTimer = m.top.findNode("autoScrollTimer")
    m.autoScrollTimer.observeField("fire", "onAutoScroll")
    
    ' Safety Timer
    m.safetyTimer = m.top.findNode("safetyTimer")
    
    ' Load initial data
    loadCuratedCollections("trending")
end sub

' ===== DATA LOADING =====

sub loadCuratedCollections(mode as string)
    m.top.curationType = mode
    
    ' UI Feedback
    m.featuredTitle.text = "Loading " + ucase(mode) + "..."
    
    if m.cryptoService <> invalid
        m.cryptoService.nftMode = mode
        m.cryptoService.nftRequest = true
        
        ' Start safety fallback
        if m.safetyTimer <> invalid
            m.safetyTimer.observeField("fire", "onSafetyTimerFired")
            m.safetyTimer.control = "start"
        end if
    else
        loadMockCollections(mode)
    end if
end sub

sub onNftDataReceived()
    data = m.cryptoService.nftData
    if data <> invalid and data.collections <> invalid
        m.collections = data.collections
        
        if m.collections.count() > 0
            print "[NFTGallery] Loaded " + str(m.collections.count()) + " collections."
            collection = m.collections[0]
            print "[NFTGallery] First collection has " + str(collection.items.count()) + " items."
            
            displayCollection(m.collections[0])
            m.autoScrollTimer.control = "start"
        else
            m.featuredTitle.text = "No Collections Found"
        end if
    end if
end sub

sub onSafetyTimerFired()
    if m.featuredTitle.text = "Loading..." or left(m.featuredTitle.text, 7) = "Loading"
        m.featuredTitle.text = "Error: Timeout connecting to " + m.cryptoService.apiBaseUrl
        ' Attempt mock load anyway
        loadMockCollections(m.top.curationType)
    end if
end sub

sub loadMockCollections(mode as string)
    ' (Mock data generation moved to separate helper or simplified for brevity - reuse same mock logic)
    ' For this component update, we assume CryptoService usually works or we use simple mocks
    ' Re-implementing basic mock for standalone safety
    
    mock = {
        name: "Mock Collection",
        slug: "mock-art",
        image: "pkg:/images/zones/nft-hero.png", 
        floor: 10,  volume24h: 1000, owners: 500, reason: "Demo Mode",
        items: []
    }
    
    for i = 1 to 6
        mock.items.push({
            title: "Art Piece #" + str(i),
            image: "pkg:/images/zones/nft-hero.png",
            price: i * 2.5
        })
    end for
    
    m.collections = [mock]
    displayCollection(mock)
end sub

' ===== DISPLAY LOGIC =====

sub displayCollection(collection as object)
    m.currentCollection = collection
    
    ' Update Collection Stats
    m.statVolume.text = "Vol: " + str(collection.volume24h) + " ETH"
    m.statOwners.text = "Owners: " + str(collection.owners)
    ' m.curationReason.text = collection.reason  'Removed: label no longer exists
    
    ' Populate Grid
    if collection.items <> invalid
        content = CreateObject("roSGNode", "ContentNode")
        for each item in collection.items
             node = content.createChild("ContentNode")
             
             ' Handle missing images
             img = item.image
             if img = invalid then img = "pkg:/images/zones/nft-hero.png"
             
             ' Standard PosterGrid fields
             node.HDPosterUrl = img
             node.ShortDescriptionLine1 = item.title
             
             ' Dynamic Price/Chain Label
             priceLabel = "0.00"
             if item.price <> invalid then priceLabel = str(item.price)
             
             chainLabel = "ETH"
             if item.chain <> invalid then chainLabel = item.chain
             
             node.ShortDescriptionLine2 = priceLabel + " " + chainLabel
        end for
        
        m.nftGrid.content = content
        
        ' Select first item to update Hero
        if collection.items.count() > 0
            updateHero(0) 
        end if
        
        m.nftGrid.setFocus(true)
    end if
end sub

sub onItemFocused(event as object)
    index = event.getData()
    updateHero(index)
end sub

sub updateHero(index as integer)
    if m.nftGrid.content = invalid then return
    item = m.nftGrid.content.getChild(index)
    
    if item <> invalid
        m.featuredImage.uri = item.HDPosterUrl
        m.featuredTitle.text = item.ShortDescriptionLine1
        m.featuredCollection.text = m.currentCollection.name ' Keep collection name
        if item.ShortDescriptionLine2 <> invalid
            m.featuredPrice.text = "Price: " + item.ShortDescriptionLine2
        else
            m.featuredPrice.text = "Floor: " + str(m.currentCollection.floor) + " ETH"
        end if
    end if
end sub

' ===== NAVIGATION =====

sub selectTab(index as integer)
    ' Reset tabs colors
    for i = 0 to m.tabs.count() - 1
        if i = index
            m.tabs[i].color = "#bc13fe"
        else
            m.tabs[i].color = "#ffffff20" 
        end if
    end for
    
    m.currentTab = index
    loadCuratedCollections(m.curationModes[index])
end sub


sub onAutoScroll()
    ' Auto-rotate collections if idle?
    ' For cinematic mode, auto-advance ITEM focus might be better visuals
    ' But careful not to hijack user navigation
    
    now = createObject("roDateTime").asSeconds()
    if (now - m.lastInteractionTime) < 10 then return
    
    ' Maybe just subtle slideshow effect?
    ' For now, keeping it simple
end sub

function onKeyEvent(key as string, press as boolean) as boolean
    if not press then return false
    
    m.lastInteractionTime = createObject("roDateTime").asSeconds()
    
    if key = "back"
        m.top.exitRequested = true
        return true
    end if
    
    ' Tab Navigation (Use Rev/Fwd or options?)
    ' Or Up/Down if grid is at bottom
    
    ' Tab Navigation - Up/Down conflicts with Grid
    ' Use Options to cycle modes
    if key = "options"
        idx = m.currentTab + 1
        if idx > 3 then idx = 0
        selectTab(idx)
        return true
    end if
    
    return false
end function
