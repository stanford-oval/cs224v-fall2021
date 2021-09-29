# Terminal Multiplexer Cheatsheet

A cheatsheet for the minimum commands needed to use some terminal multiplexers. 

## GNU Screen

- Create a new session: `screen`
- Create a new session with a name: `screen -S ${session-name}`
- Detach from the current session (without shut it down): `Ctrl + a` first, then press `d`
- List all sessions: `screen -ls`
- Reattach (enter) a session (if there is only one session): `screen -r`
- Reattach (enter) a session (if there is multiple sessions): `screen -r ${session-name}`
- Kill the current session: `Ctrl + a` first, then press `k`
  
## Tmux
- Create a new session: `tmux`
- Create a new session with a name: `tmux new -s ${session-name}`
- Detach from the current session (without shut id down): `Ctrl + b` first, then press `d`
- List all sessions: `tmux ls`
- Reattach (enter) last session: `tmux attach`
- Reattach (enter) a session by name: `tmux attach -s ${session-name}`
- Kill las session: `tmux kill-session`
- Kill a session by name: `tmux kill-session -s ${session-name}` 
