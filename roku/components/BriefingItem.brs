sub init()
    m.bg = m.top.findNode("bg")
    m.thumbnail = m.top.findNode("thumbnail")
    m.metaLabel = m.top.findNode("metaLabel")
    m.titleLabel = m.top.findNode("titleLabel")
    m.durationLabel = m.top.findNode("durationLabel")
    m.focusRing = m.top.findNode("focusRing")
end sub

sub onContentSet()
    content = m.top.itemContent
    if content = invalid then return

    m.thumbnail.uri = content.HDPosterUrl
    m.titleLabel.text = content.title
    m.metaLabel.text = content.shortDescriptionLine1 ' Podcast Name
    m.metaLabel.color = content.ShortDescriptionLine2 ' Color code
    m.durationLabel.text = content.ReleaseDate ' used for duration
end sub

sub onFocusPercentChanged()
    percent = m.top.focusPercent
    
    if percent > 0.5
        m.bg.color = "#ffffff20"
        m.focusRing.opacity = 1
    else
        m.bg.color = "#ffffff10"
        m.focusRing.opacity = 0
    end if
end sub
