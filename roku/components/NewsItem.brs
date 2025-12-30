' QChannel NewsItem
' BrightScript logic for news row item

sub init()
    m.itemContainer = m.top.findNode("itemContainer")
    m.itemBg = m.top.findNode("itemBg")
    m.focusBorder = m.top.findNode("focusBorder")
    m.sourceLabel = m.top.findNode("sourceLabel")
    m.sourceBg = m.top.findNode("sourceBg")
    m.titleLabel = m.top.findNode("titleLabel")
    m.timeLabel = m.top.findNode("timeLabel")
end sub

sub onContentSet()
    content = m.top.itemContent
    if content = invalid then return
    
    ' Set title
    if content.title <> invalid
        m.titleLabel.text = content.title
    end if
    
    ' Set source
    if content.source <> invalid
        m.sourceLabel.text = content.source
        ' Adjust source background width
        m.sourceBg.width = len(content.source) * 8 + 16
    end if
    
    ' Set time
    if content.published <> invalid
        m.timeLabel.text = content.published
    end if
end sub

sub onFocusChanged()
    focusPct = m.top.focusPercent
    
    if focusPct > 0
        m.focusBorder.opacity = focusPct
        m.itemBg.color = "#1a1a1a"
    else
        m.focusBorder.opacity = 0
        m.itemBg.color = "#0f0f0f"
    end if
end sub
