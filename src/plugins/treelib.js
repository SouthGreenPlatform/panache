/**
 *
 * Javascript library to display phylogenetic trees
 * Created by Roderic Page and modified by Alexandre Bousquet
 *
 */

//----------------------------------------------------------------------------------------
function isNumber(o) {
    return !isNaN(o - 0);
}

//----------------------------------------------------------------------------------------
function ctype_alnum(str) {
    return (str.match(/^[a-z0-9]+$/i) != null);
}

//----------------------------------------------------------------------------------------
function linePath(p0, p1) {
    return 'M ' + p0['x'] + ' ' + (p0['y'] + 7) + ' ' + p1['x'] + ' ' + (p1['y'] + 7);
}

//----------------------------------------------------------------------------------------
function drawLine(svg_id, p0, p1) {
    if ((p0['x'] === p1['x']) && (p0['y'] === p1['y'])) {
        // Do nothing
    } else {
        let line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        line.setAttribute('vector-effect', 'non-scaling-stroke');
        line.setAttribute('stroke-linecap', 'square');
        line.setAttribute('style', 'stroke:black;stroke-width:1;');
        line.setAttribute('d', linePath(p0, p1));
        let svg = document.getElementById(svg_id);
        svg.appendChild(line);
    }
}

module.exports.drawText = function(svg_id, p, string) {
    let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', p['x']);
    text.setAttribute('y', p['y'] + 3);
    text.setAttribute('dominant-baseline', 'hanging');
    text.setAttribute('font-family', 'sans-serif');
    text.setAttribute('font-size', '10px');
    text.setAttribute('text-anchor', 'start');

    let textNode = document.createTextNode(string)
    text.appendChild(textNode);

    let svg = document.getElementById(svg_id);
    svg.appendChild(text);
}


//----------------------------------------------------------------------------------------
// http://stackoverflow.com/questions/894860/set-a-default-parameter-value-for-a-javascript-function
function Node(label) {
    this.ancestor = null;
    this.child = null;
    this.sibling = null;
    this.label = typeof label !== 'undefined' ? label : '';
    this.id = 0;
    this.weight = 0;
    this.xy = [];
    this.backarc = [];
    this.depth = 0;
    this.marked = false;
    this.data = {};
}

//----------------------------------------------------------------------------------------
Node.prototype.IsLeaf = function () {
    return (!this.child);
}

//----------------------------------------------------------------------------------------
Node.prototype.GetRightMostSibling = function () {
    let p = this;
    while (p.sibling) {
        p = p.sibling;
    }
    return p;
}

//----------------------------------------------------------------------------------------
Node.prototype.GetDegree = function () {
    let degree = 0;
    let p = this;
    if (p.child) {
        degree++;
        p = p.child;
        while (p.sibling) {
            degree++;
            p = p.sibling;
        }
    }
    return degree;
}

//----------------------------------------------------------------------------------------
module.exports.Tree = function () {
    this.root = null;
    this.num_leaves = 0;
    this.num_nodes = 0;
    this.label_to_node_map = [];
    this.nodes = [];
    this.rooted = true;
    this.curnode = null;
    this.line = [];
    this.html = [];
    this.error = 0;
}

//----------------------------------------------------------------------------------------
this.Tree.prototype.NewNode = function (label) {
    let node = new Node(label);
    node.id = this.num_nodes++;
    this.nodes[node.id] = node;

    if (typeof label !== undefined) {
        this.label_to_node_map[label] = node.id;
    }

    return node;
}

//----------------------------------------------------------------------------------------
this.Tree.prototype.Parse = function (str) {
	str = str.replace(/\\"/g, "");
	str = str.replace(/\\'/g, "");

	// Strip NEXUS-style comments
	str = str.replace(/\[[^\\[]+\]/g, "");
    str = str.replace(/\(/g, "|(|");
    str = str.replace(/\)/g, "|)|");
    str = str.replace(/,/g, "|,|");
    str = str.replace(/:/g, "|:|");
    str = str.replace(/;/g, "|;|");
    str = str.replace(/\|\|/g, "|");
    str = str.replace(/^\|/, "");
    str = str.replace(/\|$/, "");

    let token = str.split("|");

    this.curnode = this.NewNode();
    this.root = this.curnode;

    let state = 0;
    let stack = [];
    let i = 0;
    let q = null;
    let label = "";

    this.error = 0;

    while ((state !== 99) && (this.error === 0)) {
        switch (state) {
            case 0:
                if (ctype_alnum(token[i].charAt(0))) {
                    this.num_leaves++;
                    label = token[i];

                    // to do: KML

                    this.curnode.label = label;
                    this.label_to_node_map[label] = this.curnode;

                    i++;
                    state = 1;
                } else {
                    if (token[i].charAt(0) === "'") {
                        label = token[i];
                        label = label.replace(/^'/, "");
                        label = label.replace(/'$/, "");
                        this.num_leaves++;

                        // to do: KML

                        this.curnode.label = label;
                        this.label_to_node_map[label] = this.curnode;

                        i++;
                        state = 1;
                    } else {
                        switch (token[i]) {
                            case '(':
                                state = 2;
                                break;

                            default:
                                state = 99;
                                this.error = 1; // syntax
                                break;
                        }
                    }
                }
                break;

            case 1: // getinternode
                switch (token[i]) {
                    case ':':
                    case ',':
                    case ')':
                        state = 2;
                        break;
                    default:
                        state = 99;
                        this.error = 1; // syntax
                        break;
                }
                break;

            case 2: // nextmove
                switch (token[i]) {
                    case ':':
                        i++;
                        if (isNumber(token[i])) {
                            this.curnode.edge_length = parseFloat(token[i]);
                            i++;
                        }
                        break;

                    case ',':
                        q = this.NewNode();
                        this.curnode.sibling = q;
                        var c = stack.length;
                        if (c === 0) {
                            state = 99;
                            this.error = 2; // missing (
                        } else {
                            q.ancestor = stack[c - 1];
                            this.curnode = q;
                            state = 0;
                            i++;
                        }
                        break;

                    case '(':
                        stack.push(this.curnode);
                        q = this.NewNode();
                        this.curnode.child = q;
                        q.ancestor = this.curnode;
                        this.curnode = q;
                        state = 0;
                        i++;
                        break;

                    case ')':
                        if (stack.length === 0) {
                            state = 99;
                            this.error = 3; // unbalanced
                        } else {
                            this.curnode = stack.pop();
                            state = 3;
                            i++;
                        }
                        break;

                    case ';':
                        if (stack.length === 0) {
                            state = 99;
                        } else {
                            state = 99;
                            this.error = 4; // stack not empty
                        }
                        break;

                    default:
                        state = 99;
                        this.error = 1; // syntax
                        break;
                }
                break;

            case 3: // finishchildren
                if (ctype_alnum(token[i].charAt(0))) {
                    this.curnode.label = token[i];
                    this.label_to_node_map[token[i]] = this.curnode;
                    i++;
                } else {
                    switch (token[i]) {
                        case ':':
                            i++;
                            if (isNumber(token[i])) {
                                this.curnode.edge_length = parseFloat(token[i]);
                                i++;
                            }
                            break;

                        case ')':
                            if (stack.length === 0) {
                                state = 99;
                                this.error = 3; // unbalanced
                            } else {
                                this.curnode = stack.pop();
                                i++;
                            }
                            break;

                        case ',':
                            q = this.NewNode();
                            this.curnode.sibling = q;

                            if (stack.length === 0) {
                                state = 99;
                                this.error = 2; // missing (
                            } else {
                                q.ancestor = stack[stack.length - 1];
                                this.curnode = q;
                                state = 0;
                                i++;
                            }
                            break;

                        case ';':
                            state = 2;
                            break;

                        default:
                            state = 99;
                            this.error = 1; // syntax
                            break;
                    }
                }
                break;
        }
    }
}

//----------------------------------------------------------------------------------------
this.Tree.prototype.ComputeWeights = function (p) {
    if (p) {
        p.weight = 0;

        this.ComputeWeights(p.child);
        this.ComputeWeights(p.sibling);

        if (p.IsLeaf()) {
            p.weight = 1;
        }
        if (p.ancestor) {
            p.ancestor.weight += p.weight;
        }
    }
}

//----------------------------------------------------------------------------------------
function NodeIterator(root) {
    this.root = root;
    this.cur = null;
    this.stack = [];
}

module.exports.NodeIterator = function(root) {
    this.root = root;
    this.cur = null;
    this.stack = [];
}

//----------------------------------------------------------------------------------------
NodeIterator.prototype.Begin = function () {
    this.cur = this.root;
    while (this.cur.child) {
        this.stack.push(this.cur);
        this.cur = this.cur.child;
    }
    return this.cur;
}

module.exports.NodeIterator.prototype.Begin = function () {
    this.cur = this.root;
    while (this.cur.child) {
        this.stack.push(this.cur);
        this.cur = this.cur.child;
    }
    return this.cur;
}

//----------------------------------------------------------------------------------------
NodeIterator.prototype.Next = function () {
    if (this.stack.length === 0) {
        this.cur = null;
    } else {
        if (this.cur.sibling) {
            let p = this.cur.sibling;
            while (p.child) {
                this.stack.push(p);
                p = p.child;
            }
            this.cur = p;
        } else {
            this.cur = this.stack.pop();
        }
    }
    return this.cur;
}

module.exports.NodeIterator.prototype.Next = function () {
    if (this.stack.length === 0) {
        this.cur = null;
    } else {
        if (this.cur.sibling) {
            let p = this.cur.sibling;
            while (p.child) {
                this.stack.push(p);
                p = p.child;
            }
            this.cur = p;
        } else {
            this.cur = this.stack.pop();
        }
    }
    return this.cur;
}

//----------------------------------------------------------------------------------------
PreorderIterator.prototype = new NodeIterator;

function PreorderIterator() {
    NodeIterator.apply(this, arguments)
}

//----------------------------------------------------------------------------------------
PreorderIterator.prototype.Begin = function () {
    this.cur = this.root;
    return this.cur;
}

//----------------------------------------------------------------------------------------
PreorderIterator.prototype.Next = function () {
    if (this.cur.child) {
        this.stack.push(this.cur);
        this.cur = this.cur.child;
    } else {
        while (this.stack.length > 0 && this.cur.sibling == null) {
            this.cur = this.stack.pop();
        }
        if (this.stack.length === 0) {
            this.cur = null;
        } else {
            this.cur = this.cur.sibling;
        }
    }
    return this.cur;
}

//----------------------------------------------------------------------------------------
module.exports.TreeDrawer = function() {
    this.leaf_count = 0;
    this.leaf_gap = 0;
    this.node_gap = 0;
    this.last_y = 0;
    this.svg_id;
}

//----------------------------------------------------------------------------------------
this.TreeDrawer.prototype.Init = function (tree, settings) {
    this.t = tree;
    this.settings = settings;
    this.left = 0;
    this.top = 0;
}


//----------------------------------------------------------------------------------------
this.TreeDrawer.prototype.CalcInternal = function (p) {
    let pt = [];
    pt['x'] = this.left + this.node_gap * (this.t.num_leaves - p.weight);
    pt['y'] = this.last_y - ((p.weight - 1) * this.leaf_gap) / 2;
    p.xy = pt;
}

//----------------------------------------------------------------------------------------
this.TreeDrawer.prototype.CalcLeaf = function (p) {
    let pt = [];

    pt['y'] = this.top + (this.leaf_count * this.leaf_gap);
    this.last_y = pt['y'];
    this.leaf_count++;

    // slanted cladogram
    pt['x'] = this.left + this.settings.width;
    p.xy = pt;
}

//----------------------------------------------------------------------------------------
this.TreeDrawer.prototype.CalcNodeGap = function () {
    if (this.t.rooted) {
        this.node_gap = this.settings.width / this.t.num_leaves;
        this.left += this.node_gap;
        this.settings.width -= this.node_gap;
    } else {
        this.node_gap = this.settings.width / (this.t.num_leaves - 1);
    }
}

//----------------------------------------------------------------------------------------
this.TreeDrawer.prototype.CalcCoordinates = function () {
    this.t.ComputeWeights(this.t.root);

    this.leaf_count = 0;
    this.leaf_gap = this.settings.height / (this.t.num_leaves - 1);

    this.CalcNodeGap();

    let n = new NodeIterator(this.t.root);
    let q = n.Begin();
    while (q != null) {
        if (q.IsLeaf()) {
            this.CalcLeaf(q);
        } else {
            this.CalcInternal(q);
        }
        q = n.Next();
    }
}

//----------------------------------------------------------------------------------------
this.TreeDrawer.prototype.DrawLeaf = function (p) {
    let p0 = p.xy
    let p1 = [];
    let anc = p.ancestor;
    if (anc) {
        p1['x'] = anc.xy['x'];
        p1['y'] = p0['y'];

        drawLine(this.settings.svg_id, p0, p1);
    }
}

//----------------------------------------------------------------------------------------
this.TreeDrawer.prototype.DrawInternal = function (p) {
    let p0 = [];
    let p1 = [];

    p0['x'] = p.xy['x'];
    p0['y'] = p.xy['y'];

    let anc = p.ancestor;
    if (anc) {
        p1['x'] = anc.xy['x'];
        p1['y'] = p0['y'];

        drawLine(this.settings.svg_id, p0, p1);
    }

    // vertical line
    let pl = p.child.xy;
    let pr = p.child.GetRightMostSibling().xy;

    // eslint-disable-next-line no-self-assign
    p0['x'] = p0['x'];
    p0['y'] = pl['y'];
    p1['x'] = p0['x'];
    p1['y'] = pr['y'];

    drawLine(this.settings.svg_id, p0, p1);
}

//----------------------------------------------------------------------------------------
this.TreeDrawer.prototype.DrawRoot = function () {
    let p0 = this.t.root.xy
    let p1 = [];
    p1['x'] = p0['x'];
    p1['y'] = p0['y'];
    p1['x'] -= this.node_gap;

    drawLine(this.settings.svg_id, p0, p1);
}

//----------------------------------------------------------------------------------------
this.TreeDrawer.prototype.Draw = function () {
    let n = new NodeIterator(this.t.root);
    let q = n.Begin();
    while (q != null) {
        if (q.IsLeaf()) {
            this.DrawLeaf(q);
        } else {
            this.DrawInternal(q);
        }
        q = n.Next();
    }
    if (this.t.rooted) {
        this.DrawRoot();
    }
}
