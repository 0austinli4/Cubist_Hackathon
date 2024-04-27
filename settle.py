import math 

def settle(dict_list, S, K, dt, mu):
    payout = 0
    if mu <= S:
        for data in dict_list:
            if data['prc'] < S:
                payout += (math.e ** K)-(math.e ** mu) + 1
            else:
                payout += math.e ** S - (K-S)
    else:
        for data in dict_list:
            if data['prc'] > S:
                payout += -(math.e ** K)+(math.e ** mu) + 1
            else:
                payout += math.e ** S + (K - S)
    return payout
