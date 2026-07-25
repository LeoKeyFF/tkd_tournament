def category_name(name, belt_from, belt_to, weight_from, weight_to, age_from, age_to, type):
    belt_range = belt_range_to_name(belt_from, belt_to)
    weight_range = weight_range_to_name(weight_from, weight_to)
    age_range = age_range_to_name(age_from, age_to)

    return name + ' ' + age_range + ' ' + belt_range + weight_range + ' (' + type + ')'


def belt_range_to_name(belt_from, belt_to):
    if belt_to == 9:
        return str(abs(belt_from)) + belt_to_name(belt_from) + ' и выше'
    if belt_from == belt_to:
        return str(abs(belt_from)) + belt_to_name(belt_from)
    else:
        if belt_to_name(belt_from) == belt_to_name(belt_to):
            return str(abs(belt_from)) + '-' + str(abs(belt_to)) + belt_to_name(belt_to)
        else:
            return str(abs(belt_from)) + belt_to_name(belt_from) + '-' + str(abs(belt_to)) + belt_to_name(belt_to)

def belt_to_name(belt):
    if belt == -11:
        return 'Академики'
    if belt < 0:
        return ' гып'
    else:
        return ' дан'

def weight_range_to_name(weight_from, weight_to):
    if not (weight_from > int(weight_from)):
        weight_from = int(weight_from)
    if not (weight_to > int(weight_to)):
        weight_to = int(weight_to)

    if weight_from == 0 and weight_to >=300:
        return ''
    
    if weight_to >= 300:
        return ' свыше ' + str(weight_from) + ' кг'
    if weight_from == 0:
        return ' до ' + str(weight_to) + ' кг'
    else:
        return ' от ' + str(weight_from) + ' до ' + str(weight_to) + ' кг'

def age_range_to_name(age_from, age_to):
    if age_to >= 200:
        return str(age_from) + ' лет и старше'
    else:
        return str(age_from) + '-' + str(age_to) + ' лет'