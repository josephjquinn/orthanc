import math
from typing import Literal

def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def _route_order_greedy(
    coords: list[tuple[float, float]],
    damage_scores: list[float],
    damage_weight: float,
) -> tuple[list[int], float]:
    n = len(coords)
    if n <= 1:
        return ([0], 0.0)
    unvisited = set(range(1, n))
    path = [0]
    total_distance_km = 0.0
    current = 0

    while unvisited:
        lat_c, lng_c = coords[current]
        dists = [(j, haversine_km(lat_c, lng_c, coords[j][0], coords[j][1])) for j in unvisited]
        if not dists:
            break
        d_max = max(d for _, d in dists) or 1.0

        best_j = None
        best_score = float("-inf")
        for j, d in dists:
            damage_norm = damage_scores[j] / 100.0
            dist_norm = d / d_max
            score = damage_weight * damage_norm - (1.0 - damage_weight) * dist_norm
            if score > best_score:
                best_score = score
                best_j = j

        if best_j is None:
            break
        j = best_j
        unvisited.discard(j)
        d_km = haversine_km(coords[current][0], coords[current][1], coords[j][0], coords[j][1])
        total_distance_km += d_km
        path.append(j)
        current = j

    return (path, total_distance_km)


def _route_order_tsp(
    coords: list[tuple[float, float]],
    damage_scores: list[float],
    damage_weight: float,
) -> tuple[list[int], float]:
    try:
        from ortools.constraint_solver import routing_enums_pb2, pywrapcp
    except ImportError:
        return _route_order_greedy(coords, damage_scores, damage_weight)

    n = len(coords)
    if n <= 1:
        return ([0], 0.0)

    SCALE = 1000
    cost_matrix: list[list[int]] = []
    for i in range(n):
        row: list[int] = []
        for j in range(n):
            if i == j:
                row.append(0)
                continue
            d_km = haversine_km(coords[i][0], coords[i][1], coords[j][0], coords[j][1])
            damage = damage_scores[j] if j < len(damage_scores) else 0.0
            cost_km = d_km * (1.0 - damage_weight * damage / 100.0)
            if j == 0:
                cost_km = 0.0
            row.append(int(round(cost_km * SCALE)))
        cost_matrix.append(row)

    manager = pywrapcp.RoutingIndexManager(n, 1, 0)
    routing = pywrapcp.RoutingModel(manager)

    def cost_callback(from_index: int, to_index: int) -> int:
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return cost_matrix[from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(cost_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )

    assignment = routing.SolveWithParameters(search_parameters)
    if not assignment:
        return _route_order_greedy(coords, damage_scores, damage_weight)

    order: list[int] = []
    index = routing.Start(0)
    while not routing.IsEnd(index):
        node = manager.IndexToNode(index)
        order.append(node)
        index = assignment.Value(routing.NextVar(index))
    if order and order[-1] != 0:
        pass
    if order and order[-1] == 0 and len(order) > 1:
        order.pop()

    total_distance_km = total_distance_km_along_order(order, coords)
    return (order, total_distance_km)


def total_distance_km_along_order(order: list[int], coords: list[tuple[float, float]]) -> float:
    if len(order) <= 1:
        return 0.0
    total = 0.0
    for i in range(len(order) - 1):
        a, b = order[i], order[i + 1]
        total += haversine_km(coords[a][0], coords[a][1], coords[b][0], coords[b][1])
    return total


def total_distance_km(order: list[int], coords: list[tuple[float, float]]) -> float:
    return total_distance_km_along_order(order, coords)


def route_order(
    hub: tuple[float, float],
    sites: list[tuple[float, float, float]],
    damage_weight: float = 1.0,
    algorithm: Literal["greedy", "tsp"] = "greedy",
) -> tuple[list[int], float]:
    damage_weight = max(0.0, min(1.0, damage_weight))
    if not sites:
        return ([0], 0.0)

    coords: list[tuple[float, float]] = [hub]
    damage_scores: list[float] = [0.0]
    for lat, lng, damage in sites:
        coords.append((lat, lng))
        damage_scores.append(float(damage))

    if algorithm == "tsp":
        return _route_order_tsp(coords, damage_scores, damage_weight)
    return _route_order_greedy(coords, damage_scores, damage_weight)
