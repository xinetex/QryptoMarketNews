' QChannel NFTItem
' BrightScript logic for NFT gallery item

sub init()
    m.cardContainer = m.top.findNode("cardContainer")
    m.nftImage = m.top.findNode("nftImage")
    m.nftTitle = m.top.findNode("nftTitle")
    m.nftPrice = m.top.findNode("nftPrice")
    m.focusBorder = m.top.findNode("focusBorder")
end sub

sub onContentSet()
    content = m.top.itemContent
    if content = invalid then return
    
    ' Set NFT image
    if content.image <> invalid
        m.nftImage.uri = content.image
    end if
    
    ' Set title
    if content.title <> invalid
        m.nftTitle.text = content.title
    else if content.name <> invalid
        m.nftTitle.text = content.name
    end if
    
    ' Set floor price
    if content.floor_price <> invalid
        m.nftPrice.text = "Floor: " + str(content.floor_price).trim() + " ETH"
    else if content.price <> invalid
        m.nftPrice.text = str(content.price).trim()
    end if
end sub

sub onFocusChanged()
    focusPct = m.top.focusPercent
    
    if focusPct > 0
        scale = 1.0 + (0.05 * focusPct)
        m.cardContainer.scale = [scale, scale]
        m.focusBorder.opacity = focusPct
        m.focusBorder.color = "#bc13fe"
        
        shift = -7 * focusPct
        m.cardContainer.translation = [shift, shift]
    else
        m.cardContainer.scale = [1.0, 1.0]
        m.focusBorder.opacity = 0
        m.cardContainer.translation = [0, 0]
    end if
end sub
