sub init()
    m.navMenu = m.top.findNode("navMenu")
    m.sectionTitle = m.top.findNode("sectionTitle")
    
    ' Populate Menu
    menuContent = CreateObject("roSGNode", "ContentNode")
    
    items = ["Home", "Live Markets", "Portfolio", "Podcasts", "NFT Gallery", "Settings"]
    
    for each item in items
        node = menuContent.createChild("ContentNode")
        node.title = item
    end for
    
    m.navMenu.content = menuContent
    
    ' Populate Content Rows (Initial Header)
    m.contentRows = m.top.findNode("contentRows")
    
    ' Defer API call to prevent init blocking
    m.loaderTimer = m.top.findNode("loaderTimer")
    m.loaderTimer.observeField("fire", "fetchPodcasts")
    m.loaderTimer.control = "start"
    
    m.navMenu.setFocus(true)
    
    m.navMenu.observeField("itemFocused", "onMenuFocus")
    m.navMenu.observeField("itemSelected", "onMenuSelect")
    
    ' Observe Row Selection
    m.contentRows.observeField("rowItemSelected", "onRowItemSelected")
end sub

sub fetchPodcasts()
    ' Create Task for background fetching
    m.contentTask = CreateObject("roSGNode", "ContentTask")
    m.contentTask.requestType = "podcasts"
    m.contentTask.observeField("contentResult", "onContentResult")
    m.contentTask.control = "run"
end sub

sub fetchZones()
    ' Create Task for background fetching
    m.contentTask = CreateObject("roSGNode", "ContentTask")
    m.contentTask.requestType = "zones"
    m.contentTask.observeField("contentResult", "onContentResult")
    m.contentTask.control = "run"
end sub

sub fetchWatchlist()
    m.contentTask = CreateObject("roSGNode", "ContentTask")
    m.contentTask.requestType = "watchlist"
    m.contentTask.observeField("contentResult", "onContentResult")
    m.contentTask.control = "run"
end sub

sub onContentResult()
    if m.contentTask <> invalid and m.contentTask.contentResult <> invalid
        m.contentRows.content = m.contentTask.contentResult
    end if
end sub

sub populateMockRows()
    rowsContent = CreateObject("roSGNode", "ContentNode")
    row = rowsContent.createChild("ContentNode")
    row.title = "Mock Podcasts"
    item = row.createChild("ContentNode")
    item.title = "Failed to Load"
    m.contentRows.content = rowsContent
end sub

sub onMenuFocus()
    index = m.navMenu.itemFocused
    content = m.navMenu.content.getChild(index)
    if content <> invalid
        m.sectionTitle.text = content.title
        
        ' Reset logic
        m.contentRows.itemComponentName = "ZoneCard" ' Default
        
        ' Load content based on section
        if content.title = "Home" or content.title = "Podcasts"
             ' Reuse podcast fetch for now
             m.loaderTimer.control = "start"
        else if content.title = "Live Markets"
             fetchZones()
        else if content.title = "Portfolio"
             fetchWatchlist()
        else if content.title = "NFT Gallery"
             m.contentRows.itemComponentName = "NFTItem" ' Switch to NFT layout
             fetchNFTs()
        else
             ' Clear rows for other modes
             m.contentRows.content = invalid
        end if
    end if
end sub

sub fetchNFTs()
    m.contentTask = CreateObject("roSGNode", "ContentTask")
    m.contentTask.requestType = "nfts"
    m.contentTask.observeField("contentResult", "onContentResult")
    m.contentTask.control = "run"
end sub



sub onRowItemSelected()
    ' User selected a video
    row = m.contentRows.rowItemSelected[0]
    col = m.contentRows.rowItemSelected[1]
    
    content = m.contentRows.content.getChild(row).getChild(col)
    
    print "Selected Video: " + content.title
    print "Link: " + content.url
    
    showWatchOnPhoneDialog(content)
end sub

sub showWatchOnPhoneDialog(content as object)
    dialog = createObject("roSGNode", "Dialog")
    dialog.title = "Watch on Mobile"
    dialog.message = "Open Prophet TV on your phone to watch: " + content.title
    dialog.buttons = ["OK"] 
    m.top.getScene().dialog = dialog
end sub

sub onMenuSelect()
    index = m.navMenu.itemFocused
    title = m.navMenu.content.getChild(index).title
    
    print "Menu Selected: " + title
    
    if title = "NFT Gallery"
        ' Signal MainScene to launch NFT mode
        m.top.getScene().launchMode = "nft"
        m.top.visible = false
    else if title = "Settings"
        ' Signal MainScene to launch Settings
        m.top.getScene().launchMode = "settings" ' We need to handle this in MainScene
        ' Actually MainScene listens for "options" button usually.
        ' Let's try to just close this layer?
        m.top.visible = false
    end if
end sub

function onKeyEvent(key as string, press as boolean) as boolean
    if not press then return false
    
    if key = "right"
        if m.navMenu.hasFocus()
            m.contentRows.setFocus(true)
            return true
        end if
    else if key = "left"
        if m.contentRows.hasFocus()
            m.navMenu.setFocus(true)
            return true
        end if
    else if key = "back"
        if m.contentRows.hasFocus()
            m.navMenu.setFocus(true)
            return true
        end if
    end if
    
    return false
end function
