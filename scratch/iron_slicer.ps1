Add-Type -AssemblyName System.Drawing
$imgPath = "d:\Peyivcin App\public\assets\missions\magic_books.png"
$img = New-Object System.Drawing.Bitmap($imgPath)
$count = 4
$sliceWidth = [Math]::Floor($img.Width / $count)
$height = $img.Height
$names = "book_stone", "book_alchemist", "book_lava", "book_mystic"

for ($i = 0; $i -lt $count; $i++) {
    $xOffset = [int]($i * $sliceWidth)
    $name = $names[$i]
    
    # Create the rectangular crop area
    $rect = New-Object System.Drawing.Rectangle($xOffset, 0, $sliceWidth, $height)
    
    # Create a New Bitmap for the slice with 32bppArgb (for transparency)
    $final = New-Object System.Drawing.Bitmap($sliceWidth, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($final)
    
    # Draw only the portion of the original image onto the new one
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $sliceWidth, $height)
    $g.DrawImage($img, $destRect, $rect, [System.Drawing.GraphicsUnit]::Pixel)
    
    # Chroma-Key background #DCDFE3
    $targetR = 220
    $targetG = 223
    $targetB = 227
    $tolerance = 50 
    
    for ($y = 0; $y -lt $height; $y++) {
        for ($x = 0; $x -lt $sliceWidth; $x++) {
            $c = $final.GetPixel($x, $y)
            $diff = [Math]::Sqrt([Math]::Pow($c.R - $targetR, 2) + [Math]::Pow($c.G - $targetG, 2) + [Math]::Pow($c.B - $targetB, 2))
            if ($diff -lt $tolerance) {
                # Ensure we also handle the white/gray bleed
                $final.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
        }
    }
    
    $outputPath = "d:\Peyivcin App\public\assets\missions\$name.png"
    $final.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $final.Dispose()
    $g.Dispose()
    Write-Host "Exported: $outputPath"
}
$img.Dispose()
