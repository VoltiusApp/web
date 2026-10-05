# An older Debian point release, so `apt upgrade` has real work to do on camera.
FROM debian:bookworm-20250113-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssh-server sudo tmux neofetch procps less ca-certificates \
 && rm -rf /var/lib/apt/lists/* && mkdir -p /run/sshd \
 && useradd -m -s /bin/bash deploy && echo deploy:deploy | chpasswd \
 && echo 'deploy ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/deploy \
 && sed -i 's/^#force_color_prompt=yes/force_color_prompt=yes/' /home/deploy/.bashrc
COPY build.sh /home/deploy/build.sh
COPY neofetch.conf /home/deploy/.config/neofetch/config.conf
# The kernel line and uptime would describe the capture box, not the pretend server.
RUN rm -f /etc/update-motd.d/10-uname && chown -R deploy:deploy /home/deploy && chmod +x /home/deploy/build.sh
# No debconf dialogs or conffile prompts in the middle of the broadcast take.
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections \
 && echo 'libraries/restart-without-asking boolean true' | debconf-set-selections \
 && printf 'Dpkg::Options { "--force-confdef"; "--force-confold"; };\n' > /etc/apt/apt.conf.d/90promo
CMD ["/usr/sbin/sshd", "-D", "-e"]
