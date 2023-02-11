const express = require('express')
const router = express.Router();
const fetchuser = require('../middleware/fetchuser')
const Note = require('../models/Note')
const { body, validationResult } = require('express-validator');


// ROUTE-1: Get all the notes deatils auth get "api/notes/fecthallnotes".  login required

router.get('/fecthallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id })
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

// ROUTE-2: For Adding all the notes content  auth get "api/notes/addnote".  login required

router.post('/addnote', fetchuser, [
    body('title', 'Enter a vaild title').isLength({ min: 3 }),
    body('descripition', 'descripation length must be 5 and more').isLength({ min: 3 }),
], async (req, res) => {
    try {
        const { title, descripition, tag } = req.body;
        //     If there is bad request with alredy email exist
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
            title, descripition, tag, user: req.user.id
        })
        const savedNote = await note.save();
        res.json(savedNote)
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

// ROUTE-3: For Upadteing exist  all the notes content  auth Put "api/notes/updatenote".  login required

router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, descripition, tag } = req.body;
    // create new note
    try {



        const newNote = {};
        if (title) { newNote.title = title };
        if (descripition) { newNote.descripition = descripition };
        if (tag) { newNote.tag = tag };

        // Find note to be update the note
        let note = await Note.findById(req.params.id)
        if (!note) { return res.status(404).send("Not Found") };

        // Allow Updation only  if userown this note

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }

})


// ROUTE-4: For Deleting existing notes content  auth Delete "api/notes/deleltenote".  login required

router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    const { title, descripition, tag } = req.body;
    try {


        // Find note to be delted to delete
        let note = await Note.findById(req.params.id)
        if (!note) { return res.status(404).send("Not Found") };

        // Allow deltion only  if userown this note

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Success": "the note has been deleted", note: note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

module.exports = router