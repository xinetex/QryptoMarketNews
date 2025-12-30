' QChannel SimpleChart Logic
' Draws a line chart using Rectangle primitives

sub init()
    m.chartArea = m.top.findNode("chartArea")
    m.lineContainer = m.top.findNode("lineContainer")
    m.maxLabel = m.top.findNode("maxLabel")
    m.minLabel = m.top.findNode("minLabel")
    
    ' Helper for format price
    m.global = m.top.getScene()
end sub

sub onDataChanged()
    data = m.top.data
    m.lineContainer.removeChildren(m.lineContainer.getChildren(m.lineContainer.getChildCount(), 0))
    
    if data = invalid or data.count() < 2 then return
    
    ' Find min/max
    minVal = data[0]
    maxVal = data[0]
    
    for each val in data
        if val < minVal then minVal = val
        if val > maxVal then maxVal = val
    end for
    
    ' Update labels
    m.maxLabel.text = formatPrice(maxVal)
    m.minLabel.text = formatPrice(minVal)
    
    range = maxVal - minVal
    if range = 0 then range = 1
    
    ' Dimensions
    width = 1100
    height = 300
    
    ' Draw line segments using small rectangles
    pointCount = data.count()
    stepX = width / (pointCount - 1)
    
    ' We simulate a line by drawing small rectangles at each point
    ' connected? Doing true lines is hard with rects, but we can do a "dot" style or simple bars.
    ' Let's try connected segments using rotation? No, rotation is expensive.
    ' Let's use a "step" chart appearance or just many dots.
    ' For 7D data (168 points hourly?), dots will look like a line.
    
    ' Reduce resolution if too many points
    stepSize = 1
    if pointCount > 100 then stepSize = 2
    
    color = m.top.lineColor
    if data[pointCount-1] < data[0] then color = "#ef4444" ' Red if down
    
    for i = 0 to pointCount - 1 step stepSize
        val = data[i]
        x = i * (width / (pointCount - 1))
        y = height - ((val - minVal) / range) * height
        
        ' Draw a point
        rect = m.lineContainer.createChild("Rectangle")
        rect.width = 4
        rect.height = 4
        rect.color = color
        rect.translation = [x, y]
        
        ' Optional: Draw vertical fill (bar chart style) for cooler look?
        ' No, let's stick to line.
    end for
    
    ' Determine trend color
    m.top.lineColor = color
end sub

function formatPrice(price as dynamic) as string
    if price = invalid then return "$0"
    if price >= 1000
        return "$" + str(int(price)).trim()
    else
        return "$" + str(price).trim()
    end if
end function
