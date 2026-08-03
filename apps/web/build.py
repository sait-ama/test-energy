import subprocess

if (input('Пуллим Гит? Y/n\n:') or 'y').lower() == 'y':
    try:
        output = subprocess.check_output('git pull origin master', shell=True, universal_newlines=True)
    except subprocess.CalledProcessError as exc:
        print('Status : FAIL', exc.returncode, exc.output)
        exit()
    else:
        print(f'Output: \n{output}\n')

obnova = int(input('Обнова?\n1 - Глобальная\n2 - Обычная\n3 - Патч\n:') or 3)

npm_version = {
    1: 'major',
    2: 'minor',
    3: 'patch',
}

output = subprocess.check_output(
    f'npm version {npm_version[obnova]} --no-workspaces-update',
    shell=True, universal_newlines=True
)

version = output.strip().replace('v', '')
build_append = ''

if (input('Отключить кеш? y/N\n:') or 'n').lower() == 'y':
    build_append = '--no-cache'

with open('.env.production', 'r') as f:
    env_prod = f.readlines()

for key, row in enumerate(env_prod):
    if 'SENTRY_RELEASE' in row:
        sentry = row.split('=')
        env_prod[key] = f'{sentry[0]}={version}\n'

with open('.env.production', 'w') as f:
    f.writelines(env_prod)

try:
    output = subprocess.check_output(
        f'docker build --push -t cr.selcloud.ru/frontend/renext:{version} -t cr.selcloud.ru/frontend/renext:latest . {build_append}',
        shell=True, universal_newlines=True
    )
except subprocess.CalledProcessError as exc:
    print('Status : FAIL', exc.returncode, exc.output)
    output = subprocess.check_output(
        f'docker build --push -t cr.selcloud.ru/frontend/renext:{version} -t cr.selcloud.ru/frontend/renext:latest . --no-cache',
        shell=True, universal_newlines=True
    )
else:
    print(f'Output: \n{output}\n')

subprocess.check_output(
    'git push origin master',
    shell=True, universal_newlines=True
)