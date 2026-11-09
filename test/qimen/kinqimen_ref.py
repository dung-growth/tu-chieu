"""Chạy kinqimen 0.0.6.6 (MIT, Ken Tang) cho danh sách thời điểm, xuất JSON để đối chiếu.
Dùng: python kinqimen_ref.py times.json out.json   (times: [[y,m,d,h,mi], ...], giờ UTC+8)
Chỉ dùng trong kiểm thử, không đưa vào production."""
import json, sys, importlib, os
import kinqimen as pkg
sys.path.insert(0, os.path.dirname(pkg.__file__))
from kinqimen import kinqimen as kq
times = json.load(open(sys.argv[1]))
out = []
for t in times:
    y, m, d, h, mi = t
    try:
        p = kq.Qimen(y, m, d, h, mi).pan(1)
        sky = p['天盤']
        if isinstance(sky, tuple): sky = sky[0]
        out.append({'t': t, 'ok': True, '排局': p['排局'], '節氣': p['節氣'], '干支': p['干支'], '旬首': p['旬首'],
                    '值符值使': p['值符值使'], '天盤': sky, '地盤': p['地盤'], '門': p['門'], '星': p['星'], '神': p['神'],
                    '旬空': p['旬空'], '驛馬': p['馬星']['驛馬']})
    except Exception as e:
        out.append({'t': t, 'ok': False, 'err': repr(e)[:200]})
json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False)
