Vagrant.configure(2) do |config|

  config.vm.box = "phusion/ubuntu-14.04-amd64"
  config.vm.network "public_network"

  # Install Git 2.*
  config.vm.provision "shell", inline: "apt-get install git g++ -y"

  # Install Node v6.*
  config.vm.provision "shell", path: "node.sh"

  # Install Docker v1.*
  config.vm.provision "shell", path: "docker.sh"

  # Copy Concierge source to Guest (without node_modules and database)
  config.vm.provision "file", source: ".", destination: "/home/vagrant/concierge"
  config.vm.provision "shell", 
    inline: "rm -rf /home/vagrant/concierge/node_modules && rm -f /home/vagrant/concierge/db/concierge.db"

end
