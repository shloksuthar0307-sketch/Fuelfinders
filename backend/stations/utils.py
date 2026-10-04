import math

def haversine(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees) in kilometers.
    """
    # Convert decimal degrees to radians 
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a)) 
    r = 6371 # Radius of earth in kilometers. Use 3956 for miles
    return c * r

def point_to_segment_distance(px, py, ax, ay, bx, by):
    """
    Calculate distance from point P to line segment AB.
    x = longitude, y = latitude.
    For simplicity, treating degrees as Euclidean plane, then scaling to km.
    This is an approximation suitable for small distances.
    """
    # Vector AB
    dx = bx - ax
    dy = by - ay
    
    # If A and B are the same point
    if dx == 0 and dy == 0:
        return haversine(py, px, ay, ax)
        
    # Project point P onto the line (A -> B)
    t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)
    
    # Clamp t to [0, 1] to ensure the closest point is on the segment
    t = max(0, min(1, t))
    
    # Find the closest point C on the segment
    cx = ax + t * dx
    cy = ay + t * dy
    
    # Return Haversine distance from P to C
    return haversine(py, px, cy, cx)

def min_distance_to_polyline(lat, lng, polyline):
    """
    polyline is a list of [lng, lat] coordinates (GeoJSON format).
    """
    min_dist = float('inf')
    for i in range(len(polyline) - 1):
        ax, ay = polyline[i]
        bx, by = polyline[i+1]
        dist = point_to_segment_distance(lng, lat, ax, ay, bx, by)
        if dist < min_dist:
            min_dist = dist
    return min_dist
