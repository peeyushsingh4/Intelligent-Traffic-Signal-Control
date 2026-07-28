#!/bin/bash
# Activate the virtual environment and set SUMO_HOME
# Usage: source setup_env.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Activate venv
source "$SCRIPT_DIR/venv/bin/activate"

# Set SUMO_HOME from pip-installed eclipse-sumo package
export SUMO_HOME="$(python3 -c 'import os, sumo; print(os.path.dirname(sumo.__file__))')"

echo "✅ Environment activated"
echo "   Python:    $(which python3)"
echo "   SUMO_HOME: $SUMO_HOME"
echo "   SUMO:      $(which sumo)"
