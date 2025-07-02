{
  description = "A Nix-flake-based Node.js development environment";

  inputs.nixpkgs.url = "https://flakehub.com/f/NixOS/nixpkgs/0.1";

  outputs =
    inputs:
    let
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forEachSupportedSystem =
        f:
        inputs.nixpkgs.lib.genAttrs supportedSystems (
          system:
          f {
            pkgs = import inputs.nixpkgs {
              inherit system;
            };
          }
        );
    in
    {
      devShells = forEachSupportedSystem (
        { pkgs }:
        {
          default = pkgs.mkShell {
            packages = with pkgs; [
              node2nix
              nodejs
              nodePackages.live-server
            ];

            shellHook = ''
              echo "Development environment loaded!"
              # The '$' must be escaped for the shell.
              echo "   - Node version: \$(node --version)"

              echo ""
              echo "Ready to go!"
              echo "   - Run 'npm start' or 'node server.js' to start your API server."
              echo "   - Run 'live-server --port=8000' to start the live server."
            '';
          };
        }
      );
    };
}
