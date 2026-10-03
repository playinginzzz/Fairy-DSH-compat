@echo off
chcp 936 >nul
title Fairy-DSH ��װ / ���£������� 5 ����
setlocal

rem ---------------------------------------------------------------
rem Fairy-DSH ��װ / ���£������棺װȫ�� 5 �������
rem
rem �� install.cmd ������ֻ��һ���������ѡ�������桹��
rem ����ͼ Dock��Ҳһ��װ�� ���� ����������֪���գ����Ե������ɱ��ļ���
rem ֻ�������� Fairy �Ļ������� install.cmd��ֻװ��ȫ�� 3 ������
rem
rem ===============================================================
rem ��������ļ�֮ǰ�ض�������Լ����
rem
rem   ���ļ������� GBK ���� + ȫ CRLF + �� BOM���� 2 ���� chcp 936��
rem
rem   ǧ��Ҫ��� UTF-8��UTF-8 �������� 936 ����ҳ�»��� cmd �ϴ�
rem   ��β���з������� rem ע���б����м��п���������ִ�У�
rem   ������ is not recognized��Ⱥ�����ʵ��ȹ����Ų��˺ܾã���
rem
rem   Ҳ��Ҫ�� GBK �治�µ��ַ���emoji��������ŵȣ���
rem ===============================================================

set "BASE=https://github.com/playinginzzz/Fairy-DSH-compat/releases/latest/download"
set "PROFILE=web"
if not "%~1"=="" set "PROFILE=%~1"

echo.
echo   ============================================
echo     Fairy-DSH ��װ / ���£������棩
echo   ============================================
echo     װ�� profile : %PROFILE%
echo     װȫ�� 5 ��  : �Ӿ� / �ʶ� / ��� / ������� / ��ͼ Dock
echo   ============================================
echo.

rem ============ װǰ���棨���������У�============
echo   ------------------------------------------------------------
echo     ע�⣺����������ͨ���װ�������������
echo   ------------------------------------------------------------
echo.
echo     [1] dsh-fairy-startup   �������
echo         ÿ�δ� DSH ������ջỰѡ�񣬲��Զ���һ���»Ự��
echo         Ҳ����˵���ϴ�û�����������б���ĶԻ������ܾ��Ҳ������ˡ�
echo.
echo     [2] dsh-browser-dock    ��ͼ Dock
echo         a) ���� /browser-dock/state �ӿڻ�ѿ��ƿ����
echo            �κ��ܷ��� DSH ��ҳ�˿ڵĳ���
echo         b) ҳ���ͼ��浽���Ӳ����
echo         c) ���� takeover ����д���� macOS ��·����
echo            �� Windows �ϸ����ò���
echo.
echo     �����������ڡ������项����
echo     �����ֻ���������� Fairy���밴 N �˳������� install.cmd��
echo.
echo   ------------------------------------------------------------
echo.
choice /c YN /n /m "     ȷ��Ҫװ�� 5 ���𣿣�Y = ����װ / N = �˳��� "
if errorlevel 2 goto bye
echo.
echo     �ã�������װ�������ʱ�����ص��ж����������
echo.

rem ============ [1/4] ��黷�� ============
echo   [1/4] ��黷��...
where pnpm >nul 2>nul
if errorlevel 1 goto nopnpm
where dsh >nul 2>nul
if errorlevel 1 goto nodsh
echo         û���⣬������
echo.

rem ============ [2/4] ���ز���װ��� ============
:step2
echo   [2/4] ���ز���װ 5 �����...
echo.
echo         �����ˢһ��� pnpm ����������ÿ�����
echo         ��������ʱ��Ῠһ��������������ġ�
echo.
rem ������ call��dsh �� npm ���ɵ� dsh.cmd���������ﲻ�� call ����
rem ��һ�� .cmd����ǰ�ű���ֱ�Ӱѿ���Ȩ����ȥ���������أ�
rem ���������Ԥ�貽�����Զִ�в�����ʵ��ȹ�����
call dsh plugin --profile %PROFILE% add ^
  "%BASE%/dsh-fairy-visual.tgz" ^
  "%BASE%/dsh-fairy-voice.tgz" ^
  "%BASE%/dsh-balance-meter.tgz" ^
  "%BASE%/dsh-browser-dock.tgz" ^
  "%BASE%/dsh-fairy-startup.tgz"
if errorlevel 1 goto fail
echo.
echo         ���װ���ˡ�
echo.

rem ============ [3/4] ��װ����Ԥ�� ============
rem Ԥ����ڲ�����ڣ����Ű�һ��ַ������� DSH �Ǵ� %DSH_HOME%\.agent-presets\ ���ģ�
rem ����Ҫ����һ�ݹ�ȥ��
set "DSHH=%DSH_HOME%"
if "%DSHH%"=="" set "DSHH=%USERPROFILE%\.dsh"
set "PRESET_SRC=%DSHH%\profiles\%PROFILE%\node_modules\dsh-fairy-visual\.agent-presets\fairy"
set "PRESET_DST=%DSHH%\.agent-presets\fairy"

if not exist "%PRESET_SRC%\preset.yml" goto nopreset
echo   [3/4] ��װ Fairy ����Ԥ��...
rem ������ robocopy /E���ϲ����壩����Ҫ���� PowerShell �� Copy-Item��
rem Ŀ��Ŀ¼�Ѵ���ʱ������������һ�㣬��ʷ�Ͼ�����ô�׳�
rem .agent-presets\fairy\fairy\ �ġ�
if not exist "%DSHH%\.agent-presets" mkdir "%DSHH%\.agent-presets"
robocopy "%PRESET_SRC%" "%PRESET_DST%" /E /NFL /NDL /NJH /NJS /NP >nul
echo         ��װ�� %PRESET_DST%
goto ok

:nopreset
echo   [3/4] �������û������Ԥ�裬������һ������Ӱ���������
goto ok

rem ============ [4/4] ��� ============
:ok
echo.
echo   ============================================
echo     [4/4] ȫ��װ���ˣ�5 ����
echo   ============================================
echo.
echo     ��ôȷ�����װ���ˣ�
echo       1) ���� DSH���ص��ٴ򿪣�
echo       2) �� ���� - Fairy����������ġ����á���
echo          ����������أ��ʶ��ؼ��������
echo       3) �������ܿ��� Fairy ��һ������˵��װ����
echo.
echo     ���� Fairy ����Ļ���
echo       ���� - Fairy���ѡ�Fairy ����Ԥ�衱���ش�
echo.
echo     ���ѣ��������ͽ�ͼ Dock ��Ĭ�����õġ�
echo       �����õĻ���������������������ж�����ǣ�
echo.
echo         dsh plugin --profile %PROFILE% remove dsh-fairy-startup dsh-browser-dock
echo.
echo     ���������������Ҳ��� Fairy��
echo       �ѱ����ڵ���������������Ⱥ������˰��㿴
echo.
pause
exit /b 0

rem ============ ʧ�ܷ�֧ ============

:nopnpm
echo.
echo   [1/4] ������飺ȱ��һ��С���ߣ��� pnpm
echo.
echo     ---- ������ô���� ----
echo     pnpm ��װ���Ҫ�õ�С���ߣ�װһ�ξ��������ˣ�
echo     ����Ӱ��������ϵ����������
echo.
echo     ---- ������ô�� ----
echo     ������Զ�����װ��װ�ú��ļ����Լ����������ܣ�
echo     ��������˫��һ�Ρ�
echo.
choice /c YN /n /m "     �����Զ�����װ�𣿣�Y = װ / N = �˳��� "
if errorlevel 2 goto bye
echo.
echo         ����װ pnpm�����ʮ����...
echo.
call npm install -g pnpm
if errorlevel 1 goto npmfail
echo         װ���ˣ�������
echo.
goto step2

:npmfail
echo.
echo   [1/4] pnpm û���Զ�װ��
echo.
echo     ---- ������ô���������þ��У�----
echo     1) �� Win �� + R������ cmd���س����򿪺�ɫ����
echo     2) ��������������ƽ�ȥ���س���
echo.
echo             npm install -g pnpm
echo.
echo     3) ���� added 1 package ֮�������������װ�ɹ���
echo     4) ������˫�����ļ�
echo.
echo     ---- �����ʾ npm �����ڲ����ⲿ���� ----
echo     ˵��������ϻ�ûװ Node.js��
echo     �� nodejs.org ���� LTS �棬һ·����һ��װ�ã�
echo     װ��ص����������д��ڣ�������˫�����ļ���
echo.
pause
exit /b 1

:nodsh
echo.
echo   [1/4] ������飺�Ҳ��� dsh ����
echo.
echo     ---- ˵��ʲô ----
echo     ��̨������ûװ DSH�����߸�װ�껹û���������С�
echo.
echo     ---- ������ô�� ----
echo     1) ȷ�� DSH �Ѿ�װ�ò�����������
echo     2) �ص�����ڣ�����˫��һ������
echo     3) ���ǲ��У����������� dsh --version��
echo        �ѽ�����շ���Ⱥ��
echo.
pause
exit /b 1

:fail
echo.
echo   ============================================
echo     [2/4] �����װʧ��
echo   ============================================
echo.
echo     �����ԭ������������ GitHub
echo     ������ֱ�� GitHub ���������߳�ʱ��
echo.
echo     ---- ������ô�� ----
echo     1) ���ϴ�������ӣ�������˫�����ļ�
echo     2) �Ѿ������ӵģ�ȷ���������ǡ�ȫ��ģʽ��
echo     3) �������Ͷ��һ�������ش���
echo.
echo     ---- ��ôȷ���ǲ����������� ----
echo     �����������ַ���Ƶ�������򿪿�����
echo.
echo         %BASE%/dsh-fairy-visual.tgz
echo.
echo         ������ = ����û���⣬�ǾͰѱ��������շ�Ⱥ��
echo         �򲻿� = �����������⣬���ϴ�������һ��
echo.
pause
exit /b 1

:bye
exit /b 0
