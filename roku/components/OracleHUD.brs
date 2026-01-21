' OracleHUD.brs - Prophet Points Display for Roku
' Displays user's Oracle tier, points, rating, streak, and progress

sub init()
    m.hudContainer = m.top.findNode("hudContainer")
    m.loadingGroup = m.top.findNode("loadingGroup")
    m.contentGroup = m.top.findNode("contentGroup")
    m.hudBorder = m.top.findNode("hudBorder")
    
    ' Data labels
    m.pointsLabel = m.top.findNode("pointsLabel")
    m.tierIconLabel = m.top.findNode("tierIconLabel")
    m.tierLabel = m.top.findNode("tierLabel")
    m.multiplierLabel = m.top.findNode("multiplierLabel")
    m.ratingLabel = m.top.findNode("ratingLabel")
    m.gradeLabel = m.top.findNode("gradeLabel")
    m.streakLabel = m.top.findNode("streakLabel")
    m.progressBar = m.top.findNode("progressBar")
    
    ' Animation elements
    m.floatingPoints = m.top.findNode("floatingPoints")
    
    ' Create animation for floating points
    m.floatAnim = createFloatAnimation()
end sub

function createFloatAnimation() as object
    anim = m.top.createChild("Animation")
    anim.id = "floatAnim"
    anim.duration = 1.5
    anim.easeFunction = "outQuad"
    
    ' Fade in -> hold -> fade out
    fadeInterp = anim.createChild("FloatFieldInterpolator")
    fadeInterp.key = [0.0, 0.2, 0.7, 1.0]
    fadeInterp.keyValue = [0.0, 1.0, 1.0, 0.0]
    fadeInterp.fieldToInterp = "floatingPoints.opacity"
    
    ' Float upward
    moveInterp = anim.createChild("Vector2DFieldInterpolator")
    moveInterp.key = [0.0, 1.0]
    moveInterp.keyValue = [[350, 20], [350, -30]]
    moveInterp.fieldToInterp = "floatingPoints.translation"
    
    return anim
end function

sub onLoadingChange()
    if m.top.isLoading
        m.loadingGroup.visible = true
        m.contentGroup.visible = false
    else
        m.loadingGroup.visible = false
        m.contentGroup.visible = true
    end if
end sub

sub onDataChange()
    ' Update Points Display with formatting
    points = m.top.totalPoints
    if points >= 1000000
        m.pointsLabel.text = formatNumber(points / 1000000, 1) + "M"
    else if points >= 1000
        m.pointsLabel.text = formatNumber(points / 1000, 1) + "K"
    else
        m.pointsLabel.text = str(points).trim()
    end if
    
    ' Update Tier
    m.tierLabel.text = m.top.tier
    m.tierLabel.color = m.top.tierColor
    m.hudBorder.color = m.top.tierColor
    m.tierIconLabel.text = m.top.tierIcon
    
    ' Update Multiplier
    mult = m.top.multiplier
    if mult >= 2.0
        m.multiplierLabel.text = str(mult).trim() + "x"
        m.multiplierLabel.color = "#8B5CF6" ' Purple for high multiplier
    else if mult > 1.0
        m.multiplierLabel.text = str(mult).trim() + "x"
        m.multiplierLabel.color = "#10b981" ' Green
    else
        m.multiplierLabel.text = "1.0x"
        m.multiplierLabel.color = "#71717a" ' Gray
    end if
    
    ' Update Prophet Rating
    m.ratingLabel.text = str(m.top.prophetRating).trim()
    m.gradeLabel.text = "(" + m.top.prophetGrade + ")"
    
    ' Color code rating
    rating = m.top.prophetRating
    if rating >= 80
        m.ratingLabel.color = "#10b981" ' Green
        m.gradeLabel.color = "#10b981"
    else if rating >= 60
        m.ratingLabel.color = "#f59e0b" ' Yellow
        m.gradeLabel.color = "#f59e0b"
    else if rating >= 40
        m.ratingLabel.color = "#ffffff" ' White
        m.gradeLabel.color = "#71717a"
    else
        m.ratingLabel.color = "#ef4444" ' Red
        m.gradeLabel.color = "#ef4444"
    end if
    
    ' Update Streak
    m.streakLabel.text = str(m.top.currentStreak).trim()
    
    ' Update Progress Bar
    progressWidth = (m.top.progressPercent / 100.0) * 380
    m.progressBar.width = progressWidth
end sub

sub onPointsAwarded()
    pts = m.top.pointsAwarded
    if pts <= 0 then return
    
    ' Display floating points animation
    m.floatingPoints.text = "+" + str(pts).trim()
    m.floatingPoints.translation = [350, 20]
    m.floatingPoints.opacity = 0
    
    ' Reset and play animation
    m.floatAnim.control = "stop"
    m.floatAnim.control = "start"
    
    ' Clear the trigger
    m.top.pointsAwarded = 0
end sub

function formatNumber(num as float, decimals as integer) as string
    ' Simple number formatting with decimals
    multiplier = 10 ^ decimals
    rounded = int(num * multiplier + 0.5) / multiplier
    result = str(rounded)
    
    ' Ensure decimal places
    if instr(1, result, ".") = 0
        result = result + ".0"
    end if
    
    return result.trim()
end function
