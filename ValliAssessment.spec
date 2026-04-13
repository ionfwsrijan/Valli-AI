# -*- mode: python ; coding: utf-8 -*-
from PyInstaller.utils.hooks import collect_data_files
from PyInstaller.utils.hooks import collect_submodules

datas = [('C:\\Users\\Srijan Jaiswal\\Documents\\New project\\\\frontend\\\\dist', 'frontend\\\\dist'), ('C:\\Users\\Srijan Jaiswal\\Documents\\New project\\\\docs', 'docs')]
hiddenimports = ['uvicorn.logging', 'uvicorn.loops.auto', 'uvicorn.protocols.http.auto', 'uvicorn.protocols.websockets.auto', 'uvicorn.lifespan.on', 'webview.platforms.winforms', 'webview.platforms.edgechromium']
datas += collect_data_files('webview')
hiddenimports += collect_submodules('webview')


a = Analysis(
    ['C:\\Users\\Srijan Jaiswal\\Documents\\New project\\\\desktop_launcher.py'],
    pathex=[],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='ValliAssessment',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['C:\\Users\\Srijan Jaiswal\\Documents\\New project\\assets\\valli_app_icon.ico'],
)
