import sys
import os; os.chdir(os.path.dirname(os.path.abspath(__file__)))
t=open('template.html').read()
js='\n'.join(open(f).read() for f in ['sfx.js','sounds.js','engine.js','game.js','main.js'])
js = js.replace('</script>','<\\/script>')
open('../index.html','w').write(t.replace('/*__SCRIPT__*/',js))
print(len(t)+len(js))
