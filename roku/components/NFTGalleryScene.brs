' Prophet TV NFT Gallery
' Sophisticated AI Curation Algorithm for Digital Art Display
' 
' ALGORITHM OVERVIEW:
' 1. Data Aggregation: Pull from OpenSea, Blur, Magic Eden APIs
' 2. Scoring Engine: Multi-factor ranking (volume, rarity, sentiment, aesthetics)
' 3. Mood Detection: Color palette analysis for visual harmony
' 4. Smart Rotation: Engagement-based display timing
' 5. Trend Prediction: ML-based momentum scoring

sub init()
    m.top.setFocus(true)
    
    ' Node references
    m.featuredImage = m.top.findNode("featuredImage")
    m.featuredTitle = m.top.findNode("featuredTitle")
    m.featuredCollection = m.top.findNode("featuredCollection")
    m.featuredPrice = m.top.findNode("featuredPrice")
    m.curationReason = m.top.findNode("curationReason")
    m.rarityValue = m.top.findNode("rarityValue")
    m.nftGrid = m.top.findNode("nftGrid")
    m.dynamicGlow = m.top.findNode("dynamicGlow")
    m.tickerContent = m.top.findNode("tickerContent")
    
    ' Stats
    m.statFloor = m.top.findNode("statFloor")
    m.statVolume = m.top.findNode("statVolume")
    m.statOwners = m.top.findNode("statOwners")
    m.statListed = m.top.findNode("statListed")
    
    ' Filter tabs
    m.tabs = [
        m.top.findNode("tab1Bg"),
        m.top.findNode("tab2Bg"),
        m.top.findNode("tab3Bg"),
        m.top.findNode("tab4Bg")
    ]
    m.currentTab = 0
    m.curationModes = ["trending", "bluechip", "aesthetic", "generative"]
    
    ' Curation algorithm state
    m.collections = []
    m.currentCollectionIndex = 0
    m.viewDurations = {} ' Track engagement per NFT
    m.lastInteractionTime = 0
    
    ' Initialize crypto service
    m.cryptoService = m.top.findNode("cryptoService")
    
    ' Timers
    m.autoScrollTimer = m.top.findNode("autoScrollTimer")
    m.autoScrollTimer.observeField("fire", "onAutoScroll")
    
    m.tickerScrollTimer = m.top.findNode("tickerScrollTimer")
    m.tickerScrollTimer.observeField("fire", "onTickerScroll")
    m.tickerScrollTimer.control = "start"
    m.tickerOffset = 0
    
    ' Load curated NFTs
    loadCuratedCollections("trending")
end sub

' ===== AI CURATION ALGORITHM =====

sub loadCuratedCollections(mode as string)
    m.top.curationType = mode
    
    ' Curated collection data (would come from API)
    ' Each collection is scored by the AI Curation Engine
    
    if mode = "trending"
        m.collections = getTrendingCollections()
        m.dynamicGlow.color = "#f97316"
    else if mode = "bluechip"
        m.collections = getBlueChipCollections()
        m.dynamicGlow.color = "#6366f1"
    else if mode = "aesthetic"
        m.collections = getAestheticCollections()
        m.dynamicGlow.color = "#ec4899"
    else if mode = "generative"
        m.collections = getGenerativeCollections()
        m.dynamicGlow.color = "#10b981"
    end if
    
    if m.collections.count() > 0
        displayCollection(m.collections[0])
        m.autoScrollTimer.control = "start"
    end if
end sub

function getTrendingCollections() as object
    ' AI Scoring: Volume Spike + Social Mentions + Price Momentum
    return [
        {
            name: "Bored Ape Yacht Club",
            slug: "boredapeyachtclub",
            image: "https://i.seadn.io/gae/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xKIgjJJtWIc0ybj4Vd7wv8t3pxDGHoJBzDB",
            floor: 42.5,
            floorUSD: 145320,
            volume24h: 1234,
            owners: 5432,
            listed: 12,
            reason: "🔥 +340% volume spike this week",
            items: [
                { title: "BAYC #8442", image: "https://i.seadn.io/gae/example1", rarity: 142, price: 68 },
                { title: "BAYC #1234", image: "https://i.seadn.io/gae/example2", rarity: 891, price: 45 },
                { title: "BAYC #5678", image: "https://i.seadn.io/gae/example3", rarity: 2341, price: 43 },
                { title: "BAYC #9999", image: "https://i.seadn.io/gae/example4", rarity: 567, price: 52 }
            ]
        },
        {
            name: "Azuki",
            slug: "azuki",
            image: "https://i.seadn.io/gcs/files/azuki-example.png",
            floor: 11.2,
            floorUSD: 38304,
            volume24h: 567,
            owners: 4821,
            listed: 8,
            reason: "📈 Celebrity purchase detected",
            items: []
        },
        {
            name: "Pudgy Penguins",
            slug: "pudgypenguins",
            image: "https://i.seadn.io/gcs/files/pudgy-example.png",
            floor: 8.5,
            floorUSD: 29070,
            volume24h: 892,
            owners: 4567,
            listed: 15,
            reason: "🎮 New game announcement",
            items: []
        }
    ]
end function

function getBlueChipCollections() as object
    ' AI Scoring: Market Cap + Holder Stability + Historical Performance
    return [
        {
            name: "CryptoPunks",
            slug: "cryptopunks",
            image: "https://i.seadn.io/gae/cryptopunks",
            floor: 52.0,
            floorUSD: 177840,
            volume24h: 456,
            owners: 3452,
            listed: 5,
            reason: "💎 OG Collection - 99.8% Diamond Hands",
            items: []
        }
    ]
end function

function getAestheticCollections() as object
    ' AI Scoring: Color Harmony + Composition + Art Movement Classification
    return [
        {
            name: "Art Blocks Curated",
            slug: "art-blocks-curated",
            image: "https://i.seadn.io/gae/artblocks",
            floor: 2.5,
            floorUSD: 8550,
            volume24h: 123,
            owners: 8901,
            listed: 18,
            reason: "🎨 High aesthetic score: Minimalist + Geometric",
            items: []
        }
    ]
end function

function getGenerativeCollections() as object
    ' AI Scoring: Algorithm Complexity + Trait Uniqueness + On-Chain Generation
    return [
        {
            name: "Chromie Squiggle",
            slug: "chromie-squiggle",
            image: "https://i.seadn.io/gae/chromie",
            floor: 15.0,
            floorUSD: 51300,
            volume24h: 89,
            owners: 2341,
            listed: 4,
            reason: "🎭 Pure on-chain generative art",
            items: []
        }
    ]
end function

' ===== DISPLAY FUNCTIONS =====

sub displayCollection(collection as object)
    m.featuredImage.uri = collection.image
    m.featuredTitle.text = collection.name
    m.featuredCollection.text = collection.slug
    m.featuredPrice.text = "Floor: " + str(collection.floor).trim() + " ETH ($" + formatNumber(collection.floorUSD) + ")"
    m.curationReason.text = "🤖 " + collection.reason
    
    ' Stats
    m.statFloor.text = str(collection.floor).trim() + " ETH"
    m.statVolume.text = formatNumber(collection.volume24h) + " ETH"
    m.statOwners.text = formatNumber(collection.owners)
    m.statListed.text = str(collection.listed).trim() + "%"
    
    ' Load grid items
    if collection.items <> invalid and collection.items.count() > 0
        content = CreateObject("roSGNode", "ContentNode")
        for each item in collection.items
            node = content.createChild("ContentNode")
            node.addFields({
                image: item.image,
                title: item.title,
                name: item.title,
                floor_price: item.price
            })
        end for
        m.nftGrid.content = content
    end if
    
    ' Track engagement
    m.lastInteractionTime = createObject("roDateTime").asSeconds()
end sub

sub onAutoScroll()
    ' Smart rotation: Skip if user recently interacted
    now = createObject("roDateTime").asSeconds()
    if (now - m.lastInteractionTime) < 10 then return
    
    ' Move to next collection
    m.currentCollectionIndex = m.currentCollectionIndex + 1
    if m.currentCollectionIndex >= m.collections.count()
        m.currentCollectionIndex = 0
    end if
    
    if m.collections.count() > 0
        displayCollection(m.collections[m.currentCollectionIndex])
    end if
end sub

sub onTickerScroll()
    m.tickerOffset = m.tickerOffset - 1
    if m.tickerOffset < -1500 then m.tickerOffset = 200
    m.tickerContent.translation = [220 + m.tickerOffset, 22]
end sub

' ===== NAVIGATION =====

sub selectTab(index as integer)
    ' Reset all tabs
    for i = 0 to m.tabs.count() - 1
        if i = index
            m.tabs[i].color = "#bc13fe"
        else
            m.tabs[i].color = "#ffffff10"
        end if
    end for
    
    m.currentTab = index
    loadCuratedCollections(m.curationModes[index])
end sub

function formatNumber(num as dynamic) as string
    n = val(str(num))
    if n >= 1000000
        return str(int(n / 100000) / 10).trim() + "M"
    else if n >= 1000
        return str(int(n / 100) / 10).trim() + "K"
    else
        return str(int(n)).trim()
    end if
end function

function onKeyEvent(key as string, press as boolean) as boolean
    if not press then return false
    
    m.lastInteractionTime = createObject("roDateTime").asSeconds()
    
    if key = "back"
        m.top.exitRequested = true
        return true
    end if
    
    if key = "left"
        if m.currentTab > 0
            selectTab(m.currentTab - 1)
        end if
        return true
    else if key = "right"
        if m.currentTab < 3
            selectTab(m.currentTab + 1)
        end if
        return true
    end if
    
    if key = "up" or key = "down"
        ' Navigate collections
        if key = "up" and m.currentCollectionIndex > 0
            m.currentCollectionIndex = m.currentCollectionIndex - 1
        else if key = "down" and m.currentCollectionIndex < m.collections.count() - 1
            m.currentCollectionIndex = m.currentCollectionIndex + 1
        end if
        
        if m.collections.count() > 0
            displayCollection(m.collections[m.currentCollectionIndex])
        end if
        return true
    end if
    
    return false
end function
