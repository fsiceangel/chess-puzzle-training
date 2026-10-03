import json, re, hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[2]
pages=json.loads((root/'tmp/pdfs/book-pages.json').read_text(encoding='utf8'))
mapping={}
for chars,piece in [('OP','P'),('MN','N'),('AB','B'),('RS','R'),('LQ','Q'),('JK','K')]:
    for c in chars: mapping[c]=piece; mapping[c.lower()]=piece.lower()
pattern=re.compile(r'(?m)^([1-9]\d{0,3})\s*\n'+''.join(fr'{rank}\s*\n([0Za-zA-Z]{{8}})\s*\n' for rank in range(8,0,-1))+r'a b c d e f g h')
diagrams={}
duplicates=[]
for page,text in enumerate(pages,1):
    for m in pattern.finditer(text):
        n=int(m[1])
        if n>5334: continue
        ranks=[]
        for row in m.groups()[1:]:
            fen=''; empty=0
            for c in row:
                if c in '0Z': empty+=1
                else:
                    if empty: fen+=str(empty); empty=0
                    fen+=mapping[c]
            if empty: fen+=str(empty)
            ranks.append(fen)
        item={'number':n,'placement':'/'.join(ranks),'page':page,'encodedRows':list(m.groups()[1:])}
        if n in diagrams: duplicates.append(n)
        else: diagrams[n]=item
solutions={}; current=None
for page,text in enumerate(pages,1):
    if not re.search(r'8\s*\.\s*1 Solutions',text): continue
    lines=text.splitlines()[1:]
    for line in lines:
        match=re.match(r'^(\d{1,4})\s+(?=\d{1,3}(?:\s*\.|\s*$))',line)
        if match and 1<=int(match[1])<=5334:
            current=int(match[1]); solutions[current]={'text':line[match.end():],'page':page}
        elif current:
            solutions[current]['text']+='\n'+line
items=[]
for n in range(1,5335):
    item=diagrams.get(n,{'number':n,'placement':None,'page':None})
    item['solution']=solutions.get(n,{}).get('text','')
    item['solutionPage']=solutions.get(n,{}).get('page')
    items.append(item)
(root/'tmp/pdfs/book-raw.json').write_text(json.dumps(items,ensure_ascii=False),encoding='utf8')
report={'diagrams':len(diagrams),'solutions':len(solutions),'missingDiagrams':[i['number'] for i in items if not i['placement']],'missingSolutions':[i['number'] for i in items if not i['solution']],'duplicateDiagrams':duplicates}
(root/'tools/book/extraction-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps(report))
